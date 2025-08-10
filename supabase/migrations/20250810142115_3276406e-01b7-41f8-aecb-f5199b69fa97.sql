-- Enable required extensions
create extension if not exists pgcrypto;
create extension if not exists postgis;
create extension if not exists pg_cron;

-- Enums
create type public.app_role as enum ('donor','recipient','admin');
create type public.blood_type as enum ('A+','A-','B+','B-','AB+','AB-','O+','O-');
create type public.request_urgency as enum ('low','medium','high','critical');
create type public.request_status as enum ('open','matched','fulfilled','cancelled','expired');
create type public.match_status as enum ('pending','accepted','declined','cancelled','completed');
create type public.push_platform as enum ('ios','android','web');
create type public.push_provider as enum ('fcm','onesignal','apns','webpush');

-- Helper function to maintain updated_at
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Roles helper (avoid recursive RLS)
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  );
$$;

-- Profiles
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
create trigger update_profiles_updated_at
before update on public.profiles
for each row execute function public.update_updated_at_column();

-- User roles
create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
alter table public.user_roles enable row level security;

-- Donor availability
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
create trigger update_donor_availability_updated_at
before update on public.donor_availability
for each row execute function public.update_updated_at_column();

-- Blood requests
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
create index if not exists idx_blood_requests_location on public.blood_requests using gist (location);
create index if not exists idx_blood_requests_status on public.blood_requests (status);
create index if not exists idx_blood_requests_needed_at on public.blood_requests (needed_at);
create trigger update_blood_requests_updated_at
before update on public.blood_requests
for each row execute function public.update_updated_at_column();

-- Validation for blood_requests times
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
create trigger validate_blood_request_time
before insert or update on public.blood_requests
for each row execute function public.validate_blood_request();

-- Matches
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
create trigger update_matches_updated_at
before update on public.matches
for each row execute function public.update_updated_at_column();

-- Notification tokens (for push)
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
create trigger update_notification_tokens_updated_at
before update on public.notification_tokens
for each row execute function public.update_updated_at_column();

-- RLS Policies
-- profiles
create policy "Users can view own profile"
on public.profiles for select
using (auth.uid() = id);

create policy "Admins can view all profiles"
on public.profiles for select
to authenticated
using (public.has_role(auth.uid(), 'admin'));

create policy "Users can insert their own profile"
on public.profiles for insert
with check (auth.uid() = id);

create policy "Users can update their own profile"
on public.profiles for update
using (auth.uid() = id);

-- user_roles
create policy "Users can view own roles"
on public.user_roles for select
using (auth.uid() = user_id);

create policy "Admins can view all roles"
on public.user_roles for select
to authenticated
using (public.has_role(auth.uid(), 'admin'));

create policy "Users can add non-admin roles for themselves"
on public.user_roles for insert
with check (auth.uid() = user_id and role <> 'admin');

create policy "Users can remove non-admin roles for themselves"
on public.user_roles for delete
using (auth.uid() = user_id and role <> 'admin');

create policy "Admins manage roles"
on public.user_roles for all
to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

-- donor_availability
create policy "Users manage own availability"
on public.donor_availability for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Admins view all availability"
on public.donor_availability for select
to authenticated
using (public.has_role(auth.uid(), 'admin'));

-- blood_requests
create policy "Requesters manage own requests"
on public.blood_requests for all
using (auth.uid() = requester_id)
with check (auth.uid() = requester_id);

create policy "Authenticated can view open requests"
on public.blood_requests for select
to authenticated
using (status = 'open');

create policy "Admins can view all requests"
on public.blood_requests for select
to authenticated
using (public.has_role(auth.uid(), 'admin'));

-- matches
create policy "Participants can view their matches"
on public.matches for select
using (
  public.has_role(auth.uid(), 'admin') or
  donor_id = auth.uid() or
  exists (
    select 1 from public.blood_requests br
    where br.id = request_id and br.requester_id = auth.uid()
  )
);

create policy "Donors can create their own match"
on public.matches for insert
with check (donor_id = auth.uid());

create policy "Requesters can invite donor"
on public.matches for insert
with check (
  exists (
    select 1 from public.blood_requests br
    where br.id = request_id and br.requester_id = auth.uid()
  )
);

create policy "Participants can update their matches"
on public.matches for update
using (
  public.has_role(auth.uid(), 'admin') or
  donor_id = auth.uid() or
  exists (
    select 1 from public.blood_requests br
    where br.id = request_id and br.requester_id = auth.uid()
  )
);

-- notification_tokens
create policy "Users manage own notification tokens"
on public.notification_tokens for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Admins view all notification tokens"
on public.notification_tokens for select
to authenticated
using (public.has_role(auth.uid(), 'admin'));

-- Realtime configuration
alter table public.blood_requests replica identity full;
alter table public.matches replica identity full;

alter publication supabase_realtime add table public.blood_requests;
alter publication supabase_realtime add table public.matches;

-- Cron job to auto-expire overdue open requests every 5 minutes
select cron.schedule(
  'expire-old-requests-every-5-min',
  '*/5 * * * *',
  $$
    update public.blood_requests
    set status = 'expired'
    where status = 'open' and needed_at < now();
  $$
);
