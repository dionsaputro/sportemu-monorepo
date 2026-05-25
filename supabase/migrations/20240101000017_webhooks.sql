-- 017 — Database Webhooks for Edge Functions
-- Note: Supabase webhooks are configured via Dashboard or pg_net extension.
-- This migration adds the pg_net extension and a helper function to call Edge Functions.

-- Enable pg_net for HTTP calls from database
create extension if not exists pg_net with schema extensions;

-- Function to call auto-invoice Edge Function when enrollment is completed
create or replace function check_enrollment_completion()
returns trigger as $$
declare
  enrollment_record record;
begin
  -- Get the updated enrollment
  select * into enrollment_record
  from enrollments
  where id = new.enrollment_id;

  -- Check if all sessions are done and it's postpaid
  if enrollment_record.sessions_done >= enrollment_record.sessions_total
     and enrollment_record.payment_type = 'postpaid'
     and enrollment_record.status = 'active' then

    -- Call auto-invoice Edge Function via pg_net
    perform net.http_post(
      url := current_setting('app.settings.supabase_url', true) || '/functions/v1/auto-invoice',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
      ),
      body := jsonb_build_object('enrollment_id', new.enrollment_id)
    );
  end if;

  return new;
end;
$$ language plpgsql security definer;

-- Trigger: after sessions_done is updated, check if enrollment is complete
create trigger on_enrollment_sessions_updated
  after update of sessions_done on enrollments
  for each row
  when (new.sessions_done > old.sessions_done)
  execute function check_enrollment_completion();

-- Function to trigger push notification on new notification insert
create or replace function trigger_push_notification()
returns trigger as $$
begin
  perform net.http_post(
    url := current_setting('app.settings.supabase_url', true) || '/functions/v1/send-push-notification',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
    ),
    body := jsonb_build_object('record', row_to_json(new))
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger: after notification is inserted, send push
create trigger on_notification_created
  after insert on notifications
  for each row
  execute function trigger_push_notification();
