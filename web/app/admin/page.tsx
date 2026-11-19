import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminClient from './admin-client'

export default async function Admin() {
  let supabase
  try {
    supabase = await createClient()
  } catch {
    redirect('/login?next=/admin')
  }

  const { data: claims } = await supabase.auth.getClaims()
  if (!claims?.claims) redirect('/login?next=/admin')

  const userId = claims.claims.sub as string
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', userId).single()
  if (profile?.role !== 'admin') redirect('/profile')

  const { data: reservations } = await supabase
    .from('reservations')
    .select('id, user_id, package_id, event_type, event_date, event_time, guest_count, selected_items, equipment, total, status, payment_status, receipt_url')
    .order('created_at', { ascending: false })

  const userIds = [...new Set((reservations || []).map((reservation) => reservation.user_id))]
  const packageIds = [...new Set((reservations || []).map((reservation) => reservation.package_id).filter((id): id is number => typeof id === 'number'))]

  const [{ data: customerProfiles }, { data: packages }] = await Promise.all([
    userIds.length ? supabase.from('profiles').select('id, full_name, phone').in('id', userIds) : Promise.resolve({ data: [] }),
    packageIds.length ? supabase.from('packages').select('id, name, price_per_person').in('id', packageIds) : Promise.resolve({ data: [] }),
  ])

  const normalizedReservations = (reservations || []).map((reservation) => ({
    ...reservation,
    profiles: (customerProfiles || []).find((customer) => customer.id === reservation.user_id) || null,
    packages: (packages || []).find((item) => item.id === reservation.package_id) || null,
  }))

  const [{ data: payments, error: paymentsError }, { data: paymentAudit, error: auditError }] = await Promise.all([
    supabase.from('reservation_payments')
      .select('id, reservation_id, customer_id, amount, payment_method, payment_type, status, receipt_path, reference_number, acknowledgment_reference, acknowledgment_path, verified_by, verified_at, created_at')
      .order('created_at', { ascending: false }),
    supabase.from('reservation_payment_audit')
      .select('id, payment_id, actor_id, action, previous_value, new_value, reason, created_at')
      .order('created_at', { ascending: false }),
  ])

  return <AdminClient
    reservations={normalizedReservations}
    payments={payments || []}
    paymentAudit={paymentAudit || []}
    paymentLedgerAvailable={!paymentsError && !auditError}
    paymentLedgerPresent={!paymentsError || !['42P01', 'PGRST205'].includes(paymentsError.code || '')}
  />
}
