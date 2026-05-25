-- 011 — Invoice Number Sequence

create sequence invoice_number_seq start 1;

create or replace function generate_invoice_number()
returns text as $$
  select 'INV-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('invoice_number_seq')::text, 4, '0');
$$ language sql;
