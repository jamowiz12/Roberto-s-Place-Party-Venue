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

type PaymentMethod = 'cash' | 'gcash_in_person' | 'maya_in_person'
type PaymentType = 'down_payment' | 'full_payment' | 'balance_payment'

function validRequestKey(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}

export async function submitReservationPayment(input: {
  reservationId: number
  paymentType: PaymentType
  paymentMethod: PaymentMethod
  requestedAmount: number | null
  receiptPath: string | null
  referenceNumber: string
  requestKey: string
}) {
  const auth = await authenticatedUser()
  if (!auth) return { error: 'Please log in before submitting a payment.' }
  if (!Number.isInteger(input.reservationId) || input.reservationId < 1) return { error: 'Invalid reservation.' }
  if (!['down_payment', 'full_payment', 'balance_payment'].includes(input.paymentType)) return { error: 'Choose a valid payment amount.' }
  if (!['cash', 'gcash_in_person', 'maya_in_person'].includes(input.paymentMethod)) return { error: 'Choose a supported in-person payment method.' }
  if (!validRequestKey(input.requestKey)) return { error: 'The payment request could not be validated. Please try again.' }
  if (input.referenceNumber.length > 100) return { error: 'Payment reference numbers must be 100 characters or fewer.' }
  if (input.receiptPath && !input.receiptPath.startsWith(`${auth.userId}/payments/`)) return { error: 'Invalid payment proof location.' }

  const { data: profile } = await auth.supabase.from('profiles').select('role').eq('id', auth.userId).single()
  if (profile?.role !== 'customer') return { error: 'Customer authorization required.' }

  const { data, error } = await auth.supabase.rpc('submit_reservation_payment', {
    p_reservation_id: input.reservationId,
    p_payment_type: input.paymentType,
    p_payment_method: input.paymentMethod,
    p_requested_amount: input.paymentType === 'balance_payment' ? input.requestedAmount : null,
    p_receipt_path: input.receiptPath,
    p_reference_number: input.referenceNumber.trim() || null,
    p_request_key: input.requestKey,
  })

  if (error) return { error: error.message || 'The payment could not be submitted.' }
  revalidatePath('/profile')
  revalidatePath('/admin')
  return { success: true, paymentId: data as number }
}

export async function removeUnreferencedPaymentProof(receiptPath: string) {
  const auth = await authenticatedUser()
  if (!auth) return { error: 'Please log in again before cleaning up payment proof.' }

  const { data: profile } = await auth.supabase.from('profiles').select('role').eq('id', auth.userId).single()
  if (profile?.role !== 'customer') return { error: 'Customer authorization required.' }

  const expectedPrefix = `${auth.userId}/payments/`
  if (!receiptPath.startsWith(expectedPrefix)) return { error: 'Invalid payment proof location.' }
  const fileName = receiptPath.slice(expectedPrefix.length)
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.[a-z0-9]{1,10}$/i.test(fileName)) {
    return { error: 'Invalid payment proof filename.' }
  }

  const [{ data: payments, error: paymentError }, { data: reservations, error: reservationError }] = await Promise.all([
    auth.supabase.from('reservation_payments').select('id').eq('receipt_path', receiptPath).limit(1),
    auth.supabase.from('reservations').select('id').eq('receipt_url', receiptPath).limit(1),
  ])
  if (paymentError || reservationError) {
    return { error: 'The proof references could not be checked; the file was left untouched.' }
  }
  if ((payments || []).length || (reservations || []).length) {
    return { success: true, removed: false, referenced: true }
  }

  const { error: removeError } = await auth.supabase.storage
    .from('payment-receipts')
    .remove([receiptPath])
  if (removeError) return { error: 'The unreferenced proof could not be removed.' }
  return { success: true, removed: true, referenced: false }
}

function escapeDocumentText(value: unknown) {
  return String(value ?? '').replace(/[\r\n\t]+/g, ' ').trim()
}

async function createVerifiedPaymentAcknowledgment(paymentId: number) {
  const admin = await requireAdmin()
  if (!admin) return { error: 'Administrator authorization required.' }

  const { data: payment, error: paymentError } = await admin.supabase
    .from('reservation_payments')
    .select('id, reservation_id, customer_id, amount, payment_method, payment_type, status, reference_number, acknowledgment_reference, acknowledgment_path, verified_at')
    .eq('id', paymentId)
    .single()
  if (paymentError || !payment || payment.status !== 'verified' || !payment.acknowledgment_reference) {
    return { error: 'A verified payment acknowledgment is not available.' }
  }

  if (payment.acknowledgment_path) {
    const { error: existingFileError } = await admin.supabase.storage
      .from('payment-receipts')
      .download(payment.acknowledgment_path)
    if (!existingFileError) return { success: true }
  }

  const [{ data: reservation }, { data: customer }] = await Promise.all([
    admin.supabase.from('reservations').select('event_type, event_date, event_time, total').eq('id', payment.reservation_id).single(),
    admin.supabase.from('profiles').select('full_name').eq('id', payment.customer_id).single(),
  ])
  if (!reservation) return { error: 'The reservation details for this acknowledgment could not be loaded.' }

  const { data: verifiedPayments } = await admin.supabase
    .from('reservation_payments')
    .select('amount')
    .eq('reservation_id', payment.reservation_id)
    .eq('status', 'verified')
  const verifiedTotal = (verifiedPayments || []).reduce((total, item) => total + Number(item.amount), 0)
  const remainingBalance = Number(reservation.total) - verifiedTotal
  const amount = Number(payment.amount)
  const methodLabels: Record<string, string> = {
    cash: 'Cash paid personally at the venue',
    gcash_in_person: 'GCash paid in person',
    maya_in_person: 'Maya paid in person',
  }
  const typeLabels: Record<string, string> = {
    down_payment: '50% down payment',
    full_payment: 'Full payment',
    balance_payment: 'Balance payment',
  }
  const currency = (value: number) => `PHP ${value.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  const document = [
    "ROBERTO'S PLACE PARTY VENUE & CATERING",
    'PAYMENT ACKNOWLEDGMENT',
    'This document acknowledges a recorded payment. It is not a BIR-compliant invoice or official receipt.',
    '',
    `Acknowledgment reference: ${escapeDocumentText(payment.acknowledgment_reference)}`,
    `Payment date: ${payment.verified_at ? new Date(payment.verified_at).toLocaleString('en-PH', { timeZone: 'Asia/Manila' }) : 'Not available'}`,
    `Customer: ${escapeDocumentText(customer?.full_name || 'Customer')}`,
    `Reservation: #${payment.reservation_id}`,
    `Event: ${escapeDocumentText(reservation.event_type || 'Event reservation')}`,
    `Event date: ${reservation.event_date || 'Not specified'}${reservation.event_time ? ` at ${reservation.event_time}` : ''}`,
    `Payment type: ${typeLabels[payment.payment_type] || escapeDocumentText(payment.payment_type)}`,
    `Payment method: ${methodLabels[payment.payment_method] || escapeDocumentText(payment.payment_method)}`,
    `Payment reference: ${escapeDocumentText(payment.reference_number || 'Not provided')}`,
    `Payment amount verified: ${currency(amount)}`,
    `Reservation total: ${currency(Number(reservation.total))}`,
    `Remaining balance: ${currency(remainingBalance)}`,
    '',
    'Verified by Roberto\'s Place staff.',
  ].join('\n')
  const filePath = `${payment.customer_id}/acknowledgments/payment-${payment.id}-${payment.acknowledgment_reference}.txt`

  const { error: uploadError } = await admin.supabase.storage
    .from('payment-receipts')
    .upload(filePath, new Blob([document], { type: 'text/plain;charset=utf-8' }), {
      contentType: 'text/plain',
      upsert: true,
    })
  if (uploadError) return { error: 'Payment was recorded, but its acknowledgment document could not be stored. Retry acknowledgment generation.' }

  const { error: pathError } = await admin.supabase.rpc('set_payment_acknowledgment_path', {
    p_payment_id: payment.id,
    p_acknowledgment_path: filePath,
  })
  if (pathError) return { error: 'Payment was recorded, but its acknowledgment could not be linked. Retry acknowledgment generation.' }

  return { success: true }
}

export async function verifyReservationPayment(input: {
  paymentId: number
  decision: 'verified' | 'rejected'
  reason: string
}) {
  const admin = await requireAdmin()
  if (!admin) return { error: 'Administrator authorization required.' }
  if (!Number.isInteger(input.paymentId) || input.paymentId < 1) return { error: 'Invalid payment.' }
  if (!['verified', 'rejected'].includes(input.decision)) return { error: 'Invalid payment decision.' }
  if (input.reason.trim().length < 3) return { error: 'Enter a reason of at least 3 characters.' }

  const { error } = await admin.supabase.rpc('verify_reservation_payment', {
    p_payment_id: input.paymentId,
    p_decision: input.decision,
    p_reason: input.reason.trim(),
  })
  if (error) return { error: error.message || 'The payment could not be updated.' }

  if (input.decision === 'verified') {
    const acknowledgment = await createVerifiedPaymentAcknowledgment(input.paymentId)
    if ('error' in acknowledgment) {
      revalidatePath('/admin')
      revalidatePath('/profile')
      return acknowledgment
    }
  }

  revalidatePath('/admin')
  revalidatePath('/profile')
  return { success: true }
}

export async function recordAdminReservationPayment(input: {
  reservationId: number
  amount: number | null
  paymentType: PaymentType
  paymentMethod: PaymentMethod
  referenceNumber: string
  reason: string
  requestKey: string
}) {
  const admin = await requireAdmin()
  if (!admin) return { error: 'Administrator authorization required.' }
  if (!Number.isInteger(input.reservationId) || input.reservationId < 1) return { error: 'Choose a valid reservation.' }
  if (!validRequestKey(input.requestKey)) return { error: 'The payment request could not be validated. Please try again.' }
  if (input.referenceNumber.length > 100) return { error: 'Payment reference numbers must be 100 characters or fewer.' }
  if (input.reason.trim().length < 3) return { error: 'Enter a reason of at least 3 characters.' }

  const { data, error } = await admin.supabase.rpc('record_admin_reservation_payment', {
    p_reservation_id: input.reservationId,
    p_amount: input.paymentType === 'balance_payment' ? input.amount : null,
    p_payment_type: input.paymentType,
    p_payment_method: input.paymentMethod,
    p_reference_number: input.referenceNumber.trim() || null,
    p_reason: input.reason.trim(),
    p_request_key: input.requestKey,
  })
  if (error) return { error: error.message || 'The payment could not be recorded.' }

  const acknowledgment = await createVerifiedPaymentAcknowledgment(data as number)
  if ('error' in acknowledgment) {
    revalidatePath('/admin')
    revalidatePath('/profile')
    return acknowledgment
  }
  revalidatePath('/admin')
  revalidatePath('/profile')
  return { success: true, paymentId: data as number }
}

export async function createPaymentAcknowledgmentSignedUrl(paymentId: number) {
  const auth = await authenticatedUser()
  if (!auth) return { error: 'Please log in again.' }

  const { data: profile } = await auth.supabase.from('profiles').select('role').eq('id', auth.userId).single()
  if (profile?.role !== 'customer' && profile?.role !== 'admin') return { error: 'Account authorization required.' }

  const { data: payment, error } = await auth.supabase
    .from('reservation_payments')
    .select('status, acknowledgment_reference, acknowledgment_path')
    .eq('id', paymentId)
    .single()
  if (error || payment?.status !== 'verified' || !payment.acknowledgment_path || !payment.acknowledgment_reference) {
    return { error: 'A verified payment acknowledgment is not available.' }
  }

  const { data: signed, error: signedError } = await auth.supabase.storage
    .from('payment-receipts')
    .createSignedUrl(payment.acknowledgment_path, 300, { download: `Payment-Acknowledgment-${payment.acknowledgment_reference}.txt` })
  if (signedError || !signed?.signedUrl) return { error: 'The payment acknowledgment could not be downloaded.' }
  return { success: true, signedUrl: signed.signedUrl }
}

export async function createPaymentProofSignedUrl(paymentId: number) {
  const admin = await requireAdmin()
  if (!admin) return { error: 'Administrator authorization required.' }

  const { data: payment, error } = await admin.supabase
    .from('reservation_payments')
    .select('receipt_path')
    .eq('id', paymentId)
    .single()
  if (error || !payment?.receipt_path) return { error: 'No payment proof is available.' }

  const { data: signed, error: signedError } = await admin.supabase.storage
    .from('payment-receipts')
    .createSignedUrl(payment.receipt_path, 300)
  if (signedError || !signed?.signedUrl) return { error: 'The payment proof could not be opened.' }
  return { success: true, signedUrl: signed.signedUrl }
}

export async function regeneratePaymentAcknowledgment(paymentId: number) {
  const admin = await requireAdmin()
  if (!admin) return { error: 'Administrator authorization required.' }
  if (!Number.isInteger(paymentId) || paymentId < 1) return { error: 'Invalid payment.' }
  const result = await createVerifiedPaymentAcknowledgment(paymentId)
  if ('error' in result) return result
  revalidatePath('/admin')
  revalidatePath('/profile')
  return { success: true }
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

  if (!Number.isInteger(reservationId) || reservationId < 1) return { error: 'Invalid reservation.' }

  const { data: reservation, error: reservationError } = await admin.supabase
    .from('reservations')
    .select('total, payment_status, receipt_url')
    .eq('id', reservationId)
    .single()
  if (reservationError || !reservation) return { error: 'Reservation not found.' }

  const { data: ledgerPayments, error: ledgerError } = await admin.supabase
    .from('reservation_payments')
    .select('amount, status')
    .eq('reservation_id', reservationId)

  const ledgerUnavailable = ledgerError && ['42P01', 'PGRST205'].includes(ledgerError.code || '')
  if (ledgerError && !ledgerUnavailable) return { error: 'Payment ledger availability could not be verified; no status change was made.' }

  if (ledgerUnavailable) {
    if (paymentStatus === 'rejected') {
      const { error } = await admin.supabase
        .from('reservations')
        .update({ payment_status: paymentStatus })
        .eq('id', reservationId)
      if (error) return { error: 'The legacy receipt could not be rejected.' }
    } else if (paymentStatus === 'paid' && reservation.payment_status !== 'paid') {
      const { error } = await admin.supabase
        .from('reservations')
        .update({ payment_status: paymentStatus })
        .eq('id', reservationId)
      if (error) return { error: 'The legacy payment status could not be updated.' }
    } else {
      return { error: 'Only legacy paid records and pending receipt rejections can use this status action.' }
    }
  } else {
    const records = ledgerPayments || []
    const verifiedTotal = records
      .filter((payment) => payment.status === 'verified')
      .reduce((sum, payment) => sum + Number(payment.amount), 0)

    if (paymentStatus === 'paid') {
      if (reservation.payment_status === 'paid' && records.length === 0) return { success: true }
      if (verifiedTotal < Number(reservation.total)) {
        return { error: 'A reservation can only be marked paid when verified ledger payments cover its total.' }
      }
      return { error: 'Ledger payment verification updates the reservation status automatically; direct paid-status changes are disabled.' }
    } else if (paymentStatus === 'rejected') {
      if (records.length > 0) return { error: 'Use the payment ledger to reject ledger-backed payments.' }
      if (reservation.payment_status !== 'pending_verification' || !reservation.receipt_url) {
        return { error: 'Only a pending legacy receipt can be rejected here.' }
      }
      const { error } = await admin.supabase.rpc('reject_legacy_reservation_receipt', {
        p_reservation_id: reservationId,
      })
      if (error) return { error: error.message || 'The legacy receipt could not be rejected.' }
    } else {
      return { error: 'Payment statuses are managed by the payment ledger.' }
    }
  }

  revalidatePath('/admin')
  revalidatePath('/profile')
  return { success: true }
}
