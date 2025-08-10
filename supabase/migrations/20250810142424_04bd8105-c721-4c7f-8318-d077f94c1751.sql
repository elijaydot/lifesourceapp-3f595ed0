-- Re-run with compatibility for Postgres: guard enum creation via DO blocks

-- Extensions
create extension if not exists pgcrypto;
create extension if not exists postgis;
create extension if not exists pg_cron;

-- Enums via DO blocks
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('donor','recipient','admin');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'blood_type') THEN
    CREATE TYPE public.blood_type AS ENUM ('A+','A-','B+','B-','AB+','AB-','O+','O-');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'request_urgency') THEN
    CREATE TYPE public.request_urgency AS ENUM ('low','medium','high','critical');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'request_status') THEN
    CREATE TYPE public.request_status AS ENUM ('open','matched','fulfilled','cancelled','expired');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'match_status') THEN
    CREATE TYPE public.match_status AS ENUM ('pending','accepted','declined','cancelled','completed');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'push_platform') THEN
    CREATE TYPE public.push_platform AS ENUM ('ios','android','web');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'push_provider') THEN
    CREATE TYPE public.push_provider AS ENUM ('fcm','onesignal','apns','webpush');
  END IF;
END $$;

-- Tables (idempotent)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  blood_type public.blood_type,
  phone text,
  city text,
  home_coord geography(Point,4326),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
alter table public.user_roles enable row level security;

create table if not exists public.donor_availability (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  available boolean not null default true,
  last_donated_at date,
  radius_km numeric not null default 25,
  current_coord geography(Point,4326),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);
alter table public.donor_availability enable row level security;

create table if not exists public.blood_requests (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references auth.users(id) on delete cascade,
  blood_type public.blood_type not null,
  urgency public.request_urgency not null default 'high',
  status public.request_status not null default 'open',
  needed_at timestamptz not null,
  description text,
  hospital_name text,
  contact_phone text,
  location geography(Point,4326) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.blood_requests enable row level security;

create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.blood_requests(id) on delete cascade,
  donor_id uuid not null references auth.users(id) on delete cascade,
  status public.match_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (request_id, donor_id)
);
alter table public.matches enable row level security;

create table if not exists public.notification_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  token text not null unique,
  platform public.push_platform not null,
  provider public.push_provider not null default 'fcm',
  device_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.notification_tokens enable row level security;

-- Functions
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  );
$$;

create or replace function public.validate_blood_request()
returns trigger as $$
begin
  if (tg_op = 'INSERT' or (tg_op = 'UPDATE' and (new.needed_at is distinct from old.needed_at))) then
    if new.needed_at < now() then
      raise exception 'needed_at must be in the future';
    end if;
  end if;
  return new;
end;
$$ language plpgsql;

-- Triggers (drop & create)
drop trigger if exists update_profiles_updated_at on public.profiles;
create trigger update_profiles_updated_at before update on public.profiles for each row execute function public.update_updated_at_column();

drop trigger if exists update_donor_availability_updated_at on public.donor_availability;
create trigger update_donor_availability_updated_at before update on public.donor_availability for each row execute function public.update_updated_at_column();

drop trigger if exists update_blood_requests_updated_at on public.blood_requests;
create trigger update_blood_requests_updated_at before update on public.blood_requests for each row execute function public.update_updated_at_column();

drop trigger if exists validate_blood_request_time on public.blood_requests;
create trigger validate_blood_request_time before insert or update on public.blood_requests for each row execute function public.validate_blood_request();

drop trigger if exists update_matches_updated_at on public.matches;
create trigger update_matches_updated_at before update on public.matches for each row execute function public.update_updated_at_column();

drop trigger if exists update_notification_tokens_updated_at on public.notification_tokens;
create trigger update_notification_tokens_updated_at before update on public.notification_tokens for each row execute function public.update_updated_at_column();

-- Indexes
create index if not exists idx_blood_requests_location on public.blood_requests using gist (location);
create index if not exists idx_blood_requests_status on public.blood_requests (status);
create index if not exists idx_blood_requests_needed_at on public.blood_requests (needed_at);

-- Policies
-- profiles
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);

drop policy if exists "Admins can view all profiles" on public.profiles;
create policy "Admins can view all profiles" on public.profiles for select to authenticated using (public.has_role(auth.uid(), 'admin'));

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile" on public.profiles for insert with check (auth.uid() = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile" on public.profiles for update using (auth.uid() = id);

-- user_roles
drop policy if exists "Users can view own roles" on public.user_roles;
create policy "Users can view own roles" on public.user_roles for select using (auth.uid() = user_id);

drop policy if exists "Admins can view all roles" on public.user_roles;
create policy "Admins can view all roles" on public.user_roles for select to authenticated using (public.has_role(auth.uid(), 'admin'));

drop policy if exists "Users can add non-admin roles for themselves" on public.user_roles;
create policy "Users can add non-admin roles for themselves" on public.user_roles for insert with check (auth.uid() = user_id and role <> 'admin');

drop policy if exists "Users can remove non-admin roles for themselves" on public.user_roles;
create policy "Users can remove non-admin roles for themselves" on public.user_roles for delete using (auth.uid() = user_id and role <> 'admin');

drop policy if exists "Admins manage roles" on public.user_roles;
create policy "Admins manage roles" on public.user_roles for all to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- donor_availability
drop policy if exists "Users manage own availability" on public.donor_availability;
create policy "Users manage own availability" on public.donor_availability for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Admins view all availability" on public.donor_availability;
create policy "Admins view all availability" on public.donor_availability for select to authenticated using (public.has_role(auth.uid(), 'admin'));

-- blood_requests
drop policy if exists "Requesters manage own requests" on public.blood_requests;
create policy "Requesters manage own requests" on public.blood_requests for all using (auth.uid() = requester_id) with check (auth.uid() = requester_id);

drop policy if exists "Authenticated can view open requests" on public.blood_requests;
create policy "Authenticated can view open requests" on public.blood_requests for select to authenticated using (status = 'open');

drop policy if exists "Admins can view all requests" on public.blood_requests;
create policy "Admins can view all requests" on public.blood_requests for select to authenticated using (public.has_role(auth.uid(), 'admin'));

-- matches
drop policy if exists "Participants can view their matches" on public.matches;
create policy "Participants can view their matches" on public.matches for select using ( public.has_role(auth.uid(), 'admin') or donor_id = auth.uid() or exists ( select 1 from public.blood_requests br where br.id = request_id and br.requester_id = auth.uid() ) );

drop policy if exists "Donors can create their own match" on public.matches;
create policy "Donors can create their own match" on public.matches for insert with check (donor_id = auth.uid());

drop policy if exists "Requesters can invite donor" on public.matches;
create policy "Requesters can invite donor" on public.matches for insert with check ( exists ( select 1 from public.blood_requests br where br.id = request_id and br.requester_id = auth.uid() ) );

drop policy if exists "Participants can update their matches" on public.matches;
create policy "Participants can update their matches" on public.matches for update using ( public.has_role(auth.uid(), 'admin') or donor_id = auth.uid() or exists ( select 1 from public.blood_requests br where br.id = request_id and br.requester_id = auth.uid() ) );

-- notification_tokens
drop policy if exists "Users manage own notification tokens" on public.notification_tokens;
create policy "Users manage own notification tokens" on public.notification_tokens for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Admins view all notification tokens" on public.notification_tokens;
create policy "Admins view all notification tokens" on public.notification_tokens for select to authenticated using (public.has_role(auth.uid(), 'admin'));

-- Realtime
aLTER TABLE public.blood_requests REPLICA IDENTITY FULL;
aLTER TABLE public.matches REPLICA IDENTITY FULL;

DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.blood_requests;
  EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.matches;
  EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;

-- Cron job to auto-expire
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'expire-old-requests-every-5-min') THEN
    PERFORM cron.schedule(
      'expire-old-requests-every-5-min',
      '*/5 * * * *',
      $$
        update public.blood_requests set status = 'expired' where status = 'open' and needed_at < now();
      $$
    );
  END IF;
END $$;