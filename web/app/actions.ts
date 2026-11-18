'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

async function authenticatedUser() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getClaims()
  if (error || !data?.claims) return null
  return { supabase, userId: data.claims.sub as string }
}

async function requireAdmin() {
  const auth = await authenticatedUser()
  if (!auth) return null
  const { supabase, userId } = auth
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', userId).single()
  if (profile?.role !== 'admin') return null
  return { supabase, userId }
}

export async function updateProfile(formData: FormData) {
  const auth = await authenticatedUser()
  if (!auth) redirect('/login?next=/profile')
  const fullName = String(formData.get('fullName') || '').trim()
  const phone = String(formData.get('phone') || '').trim()
  if (fullName.length > 100 || phone.length > 30) return { error: 'One or more profile fields are too long.' }

  const { error } = await auth.supabase
    .from('profiles')
    .update({ full_name: fullName, phone })
    .eq('id', auth.userId)

  if (error) return { error: 'Your profile could not be updated.' }
  revalidatePath('/profile')
  return { success: true }
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}

export async function createReservation(input: {
  packageId: number | null
  eventType: string
  eventDate: string
  eventTime: string
  guestCount: number
  selectedItems: unknown[]
  equipment: unknown[]
}) {
  const auth = await authenticatedUser()
  if (!auth) return { error: 'Please log in before submitting a reservation.' }

  if (!input.eventType.trim()) return { error: 'Event type is required.' }
  if (!Number.isInteger(input.guestCount) || input.guestCount < 1 || input.guestCount > 5000) return { error: 'Enter a valid guest count.' }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.eventDate)) return { error: 'Select a valid event date.' }
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(input.eventTime)) return { error: 'Select a valid event time.' }

  const eventDate = new Date(`${input.eventDate}T00:00:00`)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  if (eventDate < today) return { error: 'Event date cannot be in the past.' }

  const { data, error } = await auth.supabase.rpc('create_reservation', {
    p_package_id: input.packageId,
    p_event_type: input.eventType.trim(),
    p_event_date: input.eventDate,
    p_event_time: input.eventTime,
    p_guest_count: input.guestCount,
    p_selected_items: input.selectedItems,
    p_equipment: input.equipment,
  })

  if (error) return { error: error.message }
  revalidatePath('/profile')
  revalidatePath('/admin')
  return { success: true, reservationId: data as number }
}

export async function attachReservationReceipt(reservationId: number, receiptPath: string) {
  const auth = await authenticatedUser()
  if (!auth) return { error: 'Please log in again.' }

  const expectedPrefix = `${auth.userId}/`
  if (!receiptPath.startsWith(expectedPrefix)) return { error: 'Invalid receipt location.' }

  const fileName = receiptPath.slice(expectedPrefix.length)
  if (!fileName || !/\.(jpe?g|png|webp|pdf)$/i.test(fileName)) {
    return { error: 'Invalid receipt file type.' }
  }

  const { data: storedFiles, error: listError } = await auth.supabase
    .storage
    .from('payment-receipts')
    .list(auth.userId, { limit: 100, search: fileName })

  const storedFile = storedFiles?.find((file) => file.name === fileName)
  if (listError || !storedFile) {
    return { error: 'The receipt file was not found in private storage.' }
  }
  if (storedFile.metadata?.size && storedFile.metadata.size > 5 * 1024 * 1024) {
    return { error: 'The receipt exceeds the 5 MB storage limit.' }
  }
  if (storedFile.metadata?.mimetype && !['image/jpeg', 'image/png', 'image/webp', 'application/pdf'].includes(storedFile.metadata.mimetype)) {
    return { error: 'The receipt has an unsupported storage MIME type.' }
  }

  const { error } = await auth.supabase.rpc('set_reservation_receipt', {
    p_reservation_id: reservationId,
    p_receipt_path: receiptPath,
  })
  if (error) return { error: error.message }
  revalidatePath('/profile')
  revalidatePath('/admin')
  return { success: true }
}

export async function createReceiptSignedUrl(reservationId: number) {
  const auth = await authenticatedUser()
  if (!auth) return { error: 'Please log in again.' }

  const { data: reservation, error } = await auth.supabase
    .from('reservations')
    .select('receipt_url')
    .eq('id', reservationId)
    .single()

  if (error || !reservation?.receipt_url) return { error: 'No authorized receipt is available.' }

  const { data: profile } = await auth.supabase.from('profiles').select('role').eq('id', auth.userId).single()
  const isAdmin = profile?.role === 'admin'
  if (!isAdmin && !reservation.receipt_url.startsWith(`${auth.userId}/`)) return { error: 'This receipt is not available to you.' }

  const { data: signed, error: signedError } = await auth.supabase
    .storage
    .from('payment-receipts')
    .createSignedUrl(reservation.receipt_url, 300)

  if (signedError || !signed?.signedUrl) return { error: 'The receipt could not be opened.' }
  return { success: true, signedUrl: signed.signedUrl }
}

export async function updateReservationStatus(reservationId: number, status: 'pending' | 'approved' | 'rejected') {
  const admin = await requireAdmin()
  if (!admin) return { error: 'Administrator authorization required.' }
  if (!['pending', 'approved', 'rejected'].includes(status)) return { error: 'Invalid reservation status.' }

  const { error } = await admin.supabase
    .from('reservations')
    .update({ status })
    .eq('id', reservationId)

  if (error) return { error: 'The reservation status could not be updated.' }
  revalidatePath('/admin')
  revalidatePath('/profile')
  return { success: true }
}

export async function updatePaymentStatus(reservationId: number, paymentStatus: 'unpaid' | 'pending_verification' | 'paid' | 'rejected') {
  const admin = await requireAdmin()
  if (!admin) return { error: 'Administrator authorization required.' }
  if (!['unpaid', 'pending_verification', 'paid', 'rejected'].includes(paymentStatus)) return { error: 'Invalid payment status.' }

  const { error } = await admin.supabase
    .from('reservations')
    .update({ payment_status: paymentStatus })
    .eq('id', reservationId)

  if (error) return { error: 'The payment status could not be updated.' }
  revalidatePath('/admin')
  revalidatePath('/profile')
  return { success: true }
}
