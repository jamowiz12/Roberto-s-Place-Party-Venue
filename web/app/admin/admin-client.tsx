'use client'

import { useState, useTransition } from 'react'
import { createReceiptSignedUrl, updatePaymentStatus, updateReservationStatus } from '../actions'

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

export default function AdminClient({ reservations }: { reservations: AdminReservation[] }) {
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [pending, startTransition] = useTransition()

  const run = (action: () => Promise<{ error?: string; success?: boolean }>) => {
    setError('')
    setMessage('')
    startTransition(async () => {
      const result = await action()
      if (result.error) setError(result.error || 'The requested change could not be saved.')
      else setMessage('Changes saved successfully.')
    })
  }

  const statusCount = (status: string) => reservations.filter((item) => item.status === status).length

  const openReceipt = async (reservationId: number) => {
    setError('')
    const result = await createReceiptSignedUrl(reservationId)
    if ('error' in result) setError(result.error || 'The receipt could not be opened.')
    else window.open(result.signedUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <section className="content-section">
      <p className="eyebrow">ADMINISTRATION</p>
      <h1 className="page-title">Operations dashboard</h1>

      <div className="summary-grid" style={{ marginTop: 24 }}>
        <article className="info-card"><strong style={{ fontSize: 24 }}>{reservations.length}</strong><p>Total reservations</p></article>
        <article className="info-card"><strong style={{ fontSize: 24 }}>{statusCount('pending')}</strong><p>Pending</p></article>
        <article className="info-card"><strong style={{ fontSize: 24 }}>{statusCount('approved')}</strong><p>Approved</p></article>
      </div>

      {error ? <p style={{ color: '#9B3E32' }}>{error}</p> : null}
      {message ? <p style={{ color: '#466657' }}>{message}</p> : null}

      {reservations.length === 0 ? (
        <div className="info-card" style={{ marginTop: 24 }}><p style={{ color: '#887E74' }}>No reservations have been submitted.</p></div>
      ) : (
        <div className="table-wrap" style={{ marginTop: 24 }}>
          <table className="data-table">
            <thead><tr><th>Customer</th><th>Event</th><th>Package / Total</th><th>Selections</th><th>Status</th><th>Payment</th><th>Actions</th></tr></thead>
            <tbody>
              {reservations.map((reservation) => (
                <tr key={reservation.id}>
                  <td>{reservation.profiles?.full_name || 'Unknown'}<br /><small>{reservation.profiles?.phone || 'No phone'}</small></td>
                  <td>{reservation.event_type || 'Event'}<br /><small>{reservation.event_date || 'Date pending'} • {reservation.event_time || 'Time pending'} • {reservation.guest_count} guests</small></td>
                  <td>{reservation.packages?.name || 'Custom / no package'}<br /><strong>₱{Number(reservation.total).toLocaleString()}</strong></td>
                  <td><small>Food: {Array.isArray(reservation.selected_items) ? reservation.selected_items.join(', ') : 'None'}<br />Equipment: {Array.isArray(reservation.equipment) ? reservation.equipment.join(', ') : 'None'}</small></td>
                  <td>{reservation.status}</td>
                  <td>{reservation.payment_status}</td>
                  <td>
                    {reservation.receipt_url ? <button type="button" className="pill" onClick={() => openReceipt(reservation.id)}>View receipt</button> : null}
                    <button type="button" className="pill" disabled={pending} onClick={() => { if (window.confirm('Approve this reservation?')) run(() => updateReservationStatus(reservation.id, 'approved')) }}>Approve</button>
                    <button type="button" className="pill" disabled={pending} onClick={() => { if (window.confirm('Reject this reservation?')) run(() => updateReservationStatus(reservation.id, 'rejected')) }}>Reject</button>
                    <button type="button" className="pill" disabled={pending} onClick={() => run(() => updatePaymentStatus(reservation.id, 'paid'))}>Mark paid</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
