import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProfileClient from './profile-client'

export default async function Profile({
  searchParams,
}: {
  searchParams: Promise<{ payment?: string }>
}) {
  const params = await searchParams
  const paymentReservationId = Number(params.payment)
  const initialPaymentReservationId =
    Number.isSafeInteger(paymentReservationId) && paymentReservationId > 0
      ? paymentReservationId
      : null
  let supabase
  try {
    supabase = await createClient()
  } catch {
    redirect('/login?next=/profile')
  }

  const { data: claims } = await supabase.auth.getClaims()
  if (!claims?.claims) redirect('/login?next=/profile')

  const userId = claims.claims.sub as string
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, phone, role, created_at')
    .eq('id', userId)
    .single()

  if (profile?.role === 'admin') redirect('/admin')
  if (profile?.role !== 'customer') redirect('/login?next=/profile')

  const { data: reservations } = await supabase
    .from('reservations')
    .select('id, event_type, event_date, event_time, guest_count, selected_items, equipment, total, status, payment_status, receipt_url, package_id')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  const { data: payments, error: paymentLedgerError } = await supabase
    .from('reservation_payments')
    .select('id, reservation_id, amount, payment_method, payment_type, status, receipt_path, reference_number, acknowledgment_reference, acknowledgment_path, verified_at, created_at')
    .eq('customer_id', userId)
    .order('created_at', { ascending: false })

  return (
    <ProfileClient
      profile={{
        fullName: profile?.full_name || '',
        phone: profile?.phone || '',
        role: profile?.role || 'customer',
        createdAt: profile?.created_at || null,
      }}
      reservations={reservations || []}
      payments={payments || []}
      paymentLedgerAvailable={!paymentLedgerError}
      initialPaymentReservationId={initialPaymentReservationId}
    />
  )
}
