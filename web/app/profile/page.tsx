import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProfileClient from './profile-client'

export default async function Profile() {
  let supabase
  try {
    supabase = await createClient()
  } catch {
    redirect('/login?next=/profile')
  }

  const { data: claims } = await supabase.auth.getClaims()
  if (!claims?.claims) redirect('/login?next=/profile')

  const userId = claims.claims.sub as string
  const [{ data: profile }, { data: reservations }] = await Promise.all([
    supabase.from('profiles').select('full_name, phone, role, created_at').eq('id', userId).single(),
    supabase.from('reservations').select('id, event_type, event_date, event_time, guest_count, selected_items, equipment, total, status, payment_status, receipt_url, package_id').eq('user_id', userId).order('created_at', { ascending: false }),
  ])

  return (
    <ProfileClient
      profile={{
        fullName: profile?.full_name || '',
        phone: profile?.phone || '',
        role: profile?.role || 'customer',
        createdAt: profile?.created_at || null,
      }}
      reservations={reservations || []}
    />
  )
}
