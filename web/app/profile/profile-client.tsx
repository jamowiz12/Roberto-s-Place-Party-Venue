'use client'

import { useState, useTransition } from 'react'
import { createReceiptSignedUrl, logout, updateProfile } from '../actions'

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

export default function ProfileClient({ profile, reservations }: {
  profile: { fullName: string; phone: string; role: string; createdAt: string | null }
  reservations: ReservationRow[]
}) {
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [pending, startTransition] = useTransition()

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
    const result = await createReceiptSignedUrl(reservationId)
    if ('error' in result) setError(result.error || 'The receipt could not be opened.')
    else window.open(result.signedUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <section className="content-section">
      <p className="eyebrow">CUSTOMER ACCOUNT</p>
      <h1 className="page-title">Welcome, {profile.fullName || 'Customer'}</h1>

      <div className="summary-grid" style={{ marginTop: 24 }}>
        <article className="info-card"><strong style={{ fontSize: 24 }}>{reservations.length}</strong><p>Total reservations</p></article>
        <article className="info-card"><strong style={{ fontSize: 24 }}>{reservations.filter((item) => item.status === 'pending').length}</strong><p>Pending</p></article>
        <article className="info-card"><strong style={{ fontSize: 24 }}>{reservations.filter((item) => item.status === 'approved').length}</strong><p>Approved</p></article>
      </div>

      <div className="form-layout" style={{ marginTop: 28 }}>
        <form className="form-card" onSubmit={submitProfile}>
          <h2>Personal details</h2>
          <div className="field"><label htmlFor="fullName">Full name</label><input id="fullName" name="fullName" defaultValue={profile.fullName} maxLength={100} /></div>
          <div className="field"><label htmlFor="phone">Phone</label><input id="phone" name="phone" defaultValue={profile.phone} maxLength={30} /></div>
          {error ? <p style={{ color: '#9B3E32', fontSize: 13 }}>{error}</p> : null}
          {message ? <p style={{ color: '#466657', fontSize: 13 }}>{message}</p> : null}
          <button className="primary" disabled={pending} style={{ marginTop: 18 }}>{pending ? 'Saving…' : 'Save details'}</button>
        </form>

        <div>
          <h2>Reservation history</h2>
          {reservations.length === 0 ? (
            <div className="info-card"><p style={{ color: '#887E74' }}>You do not have any reservations yet.</p></div>
          ) : reservations.map((reservation) => (
            <article className="info-card" key={reservation.id} style={{ marginBottom: 12 }}>
              <h3>{reservation.event_type || 'Event reservation'}</h3>
              <p style={{ color: '#887E74' }}>{reservation.event_date || 'Date pending'} • {reservation.guest_count} guests</p>
              <p><strong>Reservation:</strong> {reservation.status} &nbsp; <strong>Payment:</strong> {reservation.payment_status}</p>
              {reservation.receipt_url ? <button type="button" className="pill" onClick={() => openReceipt(reservation.id)}>View receipt</button> : null}
            </article>
          ))}
        </div>
      </div>

      <form action={logout} style={{ marginTop: 24 }}><button type="submit" className="pill">Log out</button></form>
    </section>
  )
}
