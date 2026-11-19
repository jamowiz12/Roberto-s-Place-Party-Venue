'use client'

import { useEffect, useState, useTransition } from 'react'
import Link from 'next/link'
import { createPaymentAcknowledgmentSignedUrl, createReceiptSignedUrl, logout, updateProfile } from '../actions'
import CustomerPaymentForm from './payment-form'

export type ReservationRow = {
  id: number
  event_type: string | null
  event_date: string | null
  event_time: string | null
  guest_count: number
  selected_items: unknown
  equipment: unknown
  total: number
  status: string
  payment_status: string
  receipt_url: string | null
  package_id: number | null
}

export type CustomerPaymentRow = {
  id: number
  reservation_id: number
  amount: number
  payment_method: string
  payment_type: string
  status: string
  receipt_path: string | null
  reference_number: string | null
  acknowledgment_reference: string | null
  acknowledgment_path: string | null
  verified_at: string | null
  created_at: string
}

export default function ProfileClient({ profile, reservations, payments, paymentLedgerAvailable, initialPaymentReservationId }: {
  profile: { fullName: string; phone: string; role: string; createdAt: string | null }
  reservations: ReservationRow[]
  payments: CustomerPaymentRow[]
  paymentLedgerAvailable: boolean
  initialPaymentReservationId: number | null
}) {
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [pending, startTransition] = useTransition()
  const [receiptPending, setReceiptPending] = useState<number | null>(null)
  const [acknowledgmentPending, setAcknowledgmentPending] = useState<number | null>(null)
  const targetPaymentReservationId = initialPaymentReservationId

useEffect(() => {
    if (targetPaymentReservationId === null) return
    const target = document.getElementById(`reservation-${targetPaymentReservationId}`)
    target?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [targetPaymentReservationId])

  const statusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'Pending review',
      approved: 'Approved',
      rejected: 'Not approved',
      unpaid: 'Unpaid',
      pending_verification: 'Awaiting verification',
      paid: 'Paid',
    }
    return labels[status] || status.replaceAll('_', ' ')
  }
  const fullyPaidReservations = reservations.filter((reservation) => (
    (
      payments.filter((payment) => payment.reservation_id === reservation.id && payment.status === 'verified')
        .reduce((total, payment) => total + Number(payment.amount), 0) >= Number(reservation.total)
    ) || (
      reservation.payment_status === 'paid'
      && !payments.some((payment) => payment.reservation_id === reservation.id)
    )
  )).length
  const verifiedPaymentTotal = (reservationId: number) => payments
    .filter((payment) => payment.reservation_id === reservationId && payment.status === 'verified')
    .reduce((total, payment) => total + Number(payment.amount), 0)

  const submitProfile = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setMessage('')
    setError('')
    const formData = new FormData(event.currentTarget)
    startTransition(async () => {
      const result = await updateProfile(formData)
      if ('error' in result) setError(result.error || 'The profile could not be updated.')
      else setMessage('Profile updated successfully.')
    })
  }

  const openReceipt = async (reservationId: number) => {
    setError('')
    setReceiptPending(reservationId)
    try {
      const result = await createReceiptSignedUrl(reservationId)
      if ('error' in result) setError(result.error || 'The receipt could not be opened.')
      else window.open(result.signedUrl, '_blank', 'noopener,noreferrer')
    } catch {
      setError('The receipt could not be opened. Please try again.')
    } finally {
      setReceiptPending(null)
    }
  }

  const downloadAcknowledgment = async (paymentId: number) => {
    setError('')
    setAcknowledgmentPending(paymentId)
    try {
      const result = await createPaymentAcknowledgmentSignedUrl(paymentId)
      if ('error' in result) setError(result.error || 'The acknowledgment could not be downloaded.')
      else window.open(result.signedUrl, '_blank', 'noopener,noreferrer')
    } catch {
      setError('The acknowledgment could not be downloaded. Please try again.')
    } finally {
      setAcknowledgmentPending(null)
    }
  }

  return (
    <section className="content-section">
      <p className="eyebrow">CUSTOMER ACCOUNT</p>
      <h1 className="page-title">Welcome, {profile.fullName || 'Customer'}</h1>
      <p className="portal-intro">Review your event details, reservation progress, and payment receipts.</p>

      <div className="summary-grid account-summary">
        <article className="info-card summary-card"><span>Total reservations</span><strong>{reservations.length}</strong></article>
        <article className="info-card summary-card"><span>Pending review</span><strong>{reservations.filter((item) => item.status === 'pending').length}</strong></article>
        <article className="info-card summary-card"><span>Approved</span><strong>{reservations.filter((item) => item.status === 'approved').length}</strong></article>
        <article className="info-card summary-card"><span>Payments complete</span><strong>{fullyPaidReservations}</strong></article>
      </div>

      <div className="profile-layout">
        <section className="form-card profile-details">
          <div className="compact-heading">
            <p className="eyebrow">YOUR ACCOUNT</p>
            <h2>Personal details</h2>
          </div>
          <form onSubmit={submitProfile}>
            <div className="field"><label htmlFor="fullName">Full name</label><input id="fullName" name="fullName" defaultValue={profile.fullName} maxLength={100} /></div>
            <div className="field"><label htmlFor="phone">Phone</label><input id="phone" name="phone" defaultValue={profile.phone} maxLength={30} /></div>
            {profile.createdAt ? <p className="account-meta">Member since {new Date(profile.createdAt).toLocaleDateString()}</p> : null}
            {error ? <p className="form-error" role="alert">{error}</p> : null}
            {message ? <p className="form-success" role="status">{message}</p> : null}
            <button className="primary" disabled={pending} style={{ marginTop: 18 }}>{pending ? 'Saving…' : 'Save details'}</button>
          </form>
          <form action={logout} className="logout-form"><button type="submit" className="text-button">Log out</button></form>
        </section>

        <section className="reservation-history">
          <div className="section-heading compact-heading">
            <div><p className="eyebrow">YOUR EVENTS</p><h2>Reservation history</h2></div>
            <Link href="/booking" className="text-link">Book an event</Link>
          </div>
          {reservations.length === 0 ? (
            <div className="info-card empty-state"><p>You do not have any reservations yet.</p><Link href="/booking" className="primary-link">Start a booking</Link></div>
          ) : reservations.map((reservation) => (
              <article id={`reservation-${reservation.id}`} className="info-card reservation-card" key={reservation.id}>
                {(() => {
                  const reservationPayments = payments.filter((payment) => payment.reservation_id === reservation.id)
                  const hasLedgerActivity = reservationPayments.some((payment) => payment.status === 'verified' || payment.status === 'pending_verification')
                  const legacyPaid = reservation.payment_status === 'paid' && !hasLedgerActivity
                  const remainingBalance = legacyPaid ? 0 : Number(reservation.total) - verifiedPaymentTotal(reservation.id)
                  return (
                    <>
              <div className="reservation-card-heading">
                <div><p className="eyebrow">RESERVATION #{reservation.id}</p><h3>{reservation.event_type || 'Event reservation'}</h3></div>
                <div className="reservation-total"><span>Booking total</span><strong>₱{Number(reservation.total).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></div>
              </div>
              <p className="reservation-meta">{reservation.event_date || 'Date pending'}{reservation.event_time ? ` · ${reservation.event_time}` : ''} · {reservation.guest_count} guests</p>
                <p className="payment-balance-summary">Remaining balance <strong>₱{remainingBalance.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></p>
              <div className="reservation-statuses">
                <span>Booking <strong className={`status-badge status-${reservation.status}`}>{statusLabel(reservation.status)}</strong></span>
                <span>Payment <strong className={`status-badge status-${reservation.payment_status}`}>{statusLabel(reservation.payment_status)}</strong></span>
              </div>
              {reservation.receipt_url ? <button type="button" className="pill" disabled={receiptPending === reservation.id} onClick={() => openReceipt(reservation.id)}>{receiptPending === reservation.id ? 'Opening receipt…' : 'View payment receipt'}</button> : null}
                {legacyPaid ? <p className="payment-settled">This reservation is marked paid in the existing records. Contact the venue if you believe this is incorrect.</p> : paymentLedgerAvailable ? <CustomerPaymentForm
                reservationId={reservation.id}
                reservationTotal={Number(reservation.total)}
                verifiedTotal={verifiedPaymentTotal(reservation.id)}
                  pendingTotal={reservationPayments.filter((payment) => payment.status === 'pending_verification').reduce((total, payment) => total + Number(payment.amount), 0)}
                  downPaymentAvailable={!hasLedgerActivity}
                defaultOpen={targetPaymentReservationId === reservation.id}
              /> : <p className="payment-unavailable">Payment management is not enabled yet. Please contact the venue to arrange payment.</p>}
              <div className="payment-history">
                <h4>Payment history</h4>
                  {!paymentLedgerAvailable ? <p className="payment-empty">Payment history is unavailable until the payment system is enabled.</p> : reservationPayments.length === 0 ? (
                  <p className="payment-empty">No payments have been submitted.</p>
                  ) : reservationPayments.map((payment) => (
                  <div className="payment-history-row" key={payment.id}>
                    <div>
                      <strong>₱{Number(payment.amount).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                      <span>{payment.payment_method.replaceAll('_', ' ')} · {payment.payment_type.replaceAll('_', ' ')}</span>
                      <span>{payment.status === 'verified' ? `Verified ${payment.verified_at ? new Date(payment.verified_at).toLocaleDateString() : ''}` : payment.status === 'rejected' ? 'Not verified' : 'Awaiting staff verification'}</span>
                    </div>
                    <div className="payment-history-actions">
                      {payment.reference_number ? <small>Ref: {payment.reference_number}</small> : null}
                      {payment.status === 'verified' && payment.acknowledgment_path ? (
                        <button type="button" className="pill" disabled={acknowledgmentPending === payment.id} onClick={() => downloadAcknowledgment(payment.id)}>
                          {acknowledgmentPending === payment.id ? 'Preparing…' : 'Download acknowledgment'}
                        </button>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
                  </>
                )
              })()}
            </article>
          ))}
        </section>
      </div>
    </section>
  )
}
