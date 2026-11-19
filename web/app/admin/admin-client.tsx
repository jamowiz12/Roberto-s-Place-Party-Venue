'use client'

import { useState, useTransition } from 'react'
import { createReceiptSignedUrl, updatePaymentStatus, updateReservationStatus } from '../actions'
import PaymentManager, { type AdminPaymentRow, type PaymentAuditRow } from './payment-manager'

export type AdminReservation = {
  id: number
  user_id: string
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
  profiles: { full_name: string | null; phone: string | null } | null
  packages: { name: string; price_per_person: number | null } | null
}

export default function AdminClient({ reservations, payments, paymentAudit, paymentLedgerAvailable, paymentLedgerPresent }: {
  reservations: AdminReservation[]
  payments: AdminPaymentRow[]
  paymentAudit: PaymentAuditRow[]
  paymentLedgerAvailable: boolean
  paymentLedgerPresent: boolean
}) {
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [pending, startTransition] = useTransition()
  const [receiptPending, setReceiptPending] = useState<number | null>(null)

  const run = (action: () => Promise<{ error?: string; success?: boolean }>) => {
    setError('')
    setMessage('')
    startTransition(async () => {
      try {
        const result = await action()
        if (result.error) setError(result.error || 'The requested change could not be saved.')
        else setMessage('Changes saved successfully.')
      } catch {
        setError('The requested change could not be saved. Please try again.')
      }
    })
  }

  const statusCount = (status: string) => reservations.filter((item) => item.status === status).length
  const paymentCount = (status: string) => reservations.filter((item) => item.payment_status === status).length
  const hasLedgerPayments = (reservationId: number) => payments.some((payment) => payment.reservation_id === reservationId)
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

  return (
    <section className="content-section">
      <p className="eyebrow">ADMINISTRATION</p>
      <h1 className="page-title">Operations dashboard</h1>
      <p className="portal-intro">Review event requests, update booking decisions, and verify customer payments.</p>

      <div className="summary-grid admin-summary">
        <article className="info-card summary-card"><span>Total bookings</span><strong>{reservations.length}</strong></article>
        <article className="info-card summary-card"><span>Pending bookings</span><strong>{statusCount('pending')}</strong></article>
        <article className="info-card summary-card"><span>Approved bookings</span><strong>{statusCount('approved')}</strong></article>
        <article className="info-card summary-card"><span>Payments to verify</span><strong>{paymentCount('pending_verification')}</strong></article>
      </div>

      {error ? <p className="form-error" role="alert">{error}</p> : null}
      {message ? <p className="form-success" role="status">{message}</p> : null}

      {reservations.length === 0 ? (
        <div className="info-card empty-state" style={{ marginTop: 24 }}><p>No reservations have been submitted.</p></div>
      ) : (
        <div className="table-wrap admin-table-wrap">
          <table className="data-table admin-table">
            <thead><tr><th>Customer</th><th>Event</th><th>Package / Total</th><th>Selections</th><th>Status</th><th>Payment</th><th>Actions</th></tr></thead>
            <tbody>
              {reservations.map((reservation) => (
                <tr key={reservation.id}>
                  <td data-label="Customer">{reservation.profiles?.full_name || 'Unknown'}<br /><small>{reservation.profiles?.phone || 'No phone'}</small></td>
                  <td data-label="Event">{reservation.event_type || 'Event'}<br /><small>{reservation.event_date || 'Date pending'} · {reservation.event_time || 'Time pending'} · {reservation.guest_count} guests</small></td>
                  <td data-label="Package / Total">{reservation.packages?.name || 'Custom / no package'}<br /><strong>₱{Number(reservation.total).toLocaleString()}</strong></td>
                  <td data-label="Selections"><small>Food: {Array.isArray(reservation.selected_items) ? reservation.selected_items.join(', ') : 'None'}<br />Equipment: {Array.isArray(reservation.equipment) ? reservation.equipment.join(', ') : 'None'}</small></td>
                  <td data-label="Booking status"><span className={`status-badge status-${reservation.status}`}>{statusLabel(reservation.status)}</span></td>
                  <td data-label="Payment status"><span className={`status-badge status-${reservation.payment_status}`}>{statusLabel(reservation.payment_status)}</span></td>
                  <td data-label="Actions">
                    <div className="admin-actions">
                      {reservation.receipt_url ? <button type="button" className="pill" disabled={receiptPending === reservation.id} onClick={() => openReceipt(reservation.id)}>{receiptPending === reservation.id ? 'Opening receipt…' : 'Review receipt'}</button> : null}
                      {reservation.status === 'pending' ? <>
                        <button type="button" className="pill action-approve" disabled={pending} onClick={() => { if (window.confirm('Approve this reservation?')) run(() => updateReservationStatus(reservation.id, 'approved')) }}>Approve booking</button>
                        <button type="button" className="pill action-reject" disabled={pending} onClick={() => { if (window.confirm('Reject this reservation?')) run(() => updateReservationStatus(reservation.id, 'rejected')) }}>Reject booking</button>
                      </> : null}
                      {reservation.payment_status === 'pending_verification' && (!paymentLedgerPresent || !hasLedgerPayments(reservation.id)) ? <>
                        {!paymentLedgerPresent ? <button type="button" className="pill action-approve" disabled={pending} onClick={() => { if (window.confirm('Verify and mark this legacy receipt paid?')) run(() => updatePaymentStatus(reservation.id, 'paid')) }}>Verify legacy receipt</button> : null}
                        {reservation.receipt_url ? <button type="button" className="pill action-reject" disabled={pending} onClick={() => { if (window.confirm('Reject this legacy payment receipt?')) run(() => updatePaymentStatus(reservation.id, 'rejected')) }}>Reject legacy receipt</button> : null}
                      </> : null}
                      {reservation.payment_status === 'unpaid' && !paymentLedgerPresent ? <button type="button" className="pill" disabled={pending} onClick={() => { if (window.confirm('Confirm that this legacy payment has been received?')) run(() => updatePaymentStatus(reservation.id, 'paid')) }}>Mark legacy payment paid</button> : null}
                      {paymentLedgerPresent && hasLedgerPayments(reservation.id) ? <small>Manage payments in the ledger below.</small> : null}
                      {paymentLedgerPresent && reservation.payment_status === 'unpaid' && !hasLedgerPayments(reservation.id) ? <small>Record payments in the ledger below.</small> : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <PaymentManager reservations={reservations} payments={payments} paymentAudit={paymentAudit} paymentLedgerAvailable={paymentLedgerAvailable} />
    </section>
  )
}
