-- 015 — Database Triggers

-- Trigger: setelah session completed, update sessions_done di enrollment
create or replace function on_session_completed()
returns trigger as $$
begin
  if new.status = 'completed' and old.status != 'completed' then
    update enrollments
    set sessions_done = sessions_done + 1,
        updated_at = now()
    where id = new.enrollment_id;

    perform pg_notify('enrollment_check', new.enrollment_id::text);
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_session_status_change
  after update on sessions
  for each row execute function on_session_completed();

-- Trigger: kirim notifikasi saat session proposed
create or replace function on_session_proposed()
returns trigger as $$
begin
  if new.status = 'proposed' then
    insert into notifications (user_id, type, title, body, data)
    values (
      new.trainer_id,
      'booking_proposed',
      'Permintaan Sesi Baru',
      'Ada permintaan sesi baru yang menunggu persetujuan kamu.',
      jsonb_build_object('session_id', new.id, 'enrollment_id', new.enrollment_id)
    );
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_session_insert
  after insert on sessions
  for each row execute function on_session_proposed();
