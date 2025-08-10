-- Fix cron job creation with proper dollar-quoting to avoid syntax errors
DO $cron$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'expire-old-requests-every-5-min') THEN
    PERFORM cron.schedule(
      'expire-old-requests-every-5-min',
      '*/5 * * * *',
      $cmd$
        update public.blood_requests
        set status = 'expired'
        where status = 'open' and needed_at < now();
      $cmd$
    );
  END IF;
END
$cron$;