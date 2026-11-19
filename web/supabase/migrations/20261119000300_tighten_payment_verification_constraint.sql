alter table public.reservation_payments
  drop constraint if exists reservation_payments_verification_fields_check;

alter table public.reservation_payments
  add constraint reservation_payments_verification_fields_check check (
    (
      status = 'verified'
      and verified_by is not null
      and verified_at is not null
      and acknowledgment_reference is not null
    )
    or
    (
      status <> 'verified'
      and verified_by is null
      and verified_at is null
      and acknowledgment_reference is null
    )
  );
