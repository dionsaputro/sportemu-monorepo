-- 012 — Outstanding View

create view trainer_outstanding_view as
select
  t.id as trainer_id,
  p.full_name as trainer_name,
  t.payment_type,
  -- prepaid: sesi sudah dibayar tapi belum dijalankan
  case when t.payment_type = 'prepaid' then
    coalesce((
      select sum(e.sessions_total - e.sessions_done)
      from enrollments e
      join invoices i on i.enrollment_id = e.id
      join payments pay on pay.invoice_id = i.id
      where e.trainer_id = t.id
        and e.status = 'active'
        and pay.status = 'verified'
        and e.sessions_done < e.sessions_total
    ), 0)
  end as prepaid_sessions_owed,
  -- postpaid: total invoice belum dibayar
  case when t.payment_type = 'postpaid' then
    coalesce((
      select sum(i.amount)
      from invoices i
      join enrollments e on e.id = i.enrollment_id
      where e.trainer_id = t.id
        and i.status in ('sent', 'overdue')
    ), 0)
  end as postpaid_amount_owed
from trainers t
join profiles p on p.id = t.id
where t.is_active = true;
