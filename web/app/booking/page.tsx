'use client'

import { useEffect, useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { attachReservationReceipt, createReservation } from '../actions'

type PackageRow = {
  id: number
  name: string
  description: string | null
  price_per_person: number | null
  inclusions: unknown
}

const foodOptions = ['Beef Caldereta', 'Chicken Inasal', 'Pancit Canton', 'Garden Vegetables', 'Fruit Platter']
const equipmentOptions = ['Tables', 'Chairs', 'Sound system', 'Tent', 'Linens']

export default function Booking() {
  const [step, setStep] = useState(1)
  const [packages, setPackages] = useState<PackageRow[]>([])
  const [packageId, setPackageId] = useState<number | null>(null)
  const [selectedFood, setSelectedFood] = useState<string[]>([])
  const [equipment, setEquipment] = useState<string[]>([])
  const [guestCount, setGuestCount] = useState(80)
  const [eventType, setEventType] = useState('Birthday')
  const [eventDate, setEventDate] = useState('')
  const [eventTime, setEventTime] = useState('')
  const [reservationId, setReservationId] = useState<number | null>(null)
  const [receipt, setReceipt] = useState<File | null>(null)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, startTransition] = useTransition()

  useEffect(() => {
    const supabase = createClient()
    supabase.from('packages').select('id, name, description, price_per_person, inclusions').eq('active', true).then(({ data }) => {
      setPackages(data || [])
      if (data?.length) setPackageId(data[0].id)
    })
  }, [])

  const selectedPackage = packages.find((item) => item.id === packageId)
  const packagePrice = selectedPackage?.price_per_person
  const total = Math.max(0, guestCount) * Number(packagePrice || 0)

  const toggle = (value: string, values: string[], setter: (values: string[]) => void) => {
    setter(values.includes(value) ? values.filter((item) => item !== value) : [...values, value])
  }

  const submitReservation = () => {
    setError('')
    setMessage('')
    if (!eventDate || !eventTime) {
      setError('Select an event date and time.')
      return
    }
    if (!Number.isInteger(guestCount) || guestCount < 1 || guestCount > 5000) {
      setError('Enter a valid guest count from 1 to 5000.')
      return
    }

    startTransition(async () => {
      const result = await createReservation({
        packageId,
        eventType,
        eventDate,
        eventTime,
        guestCount,
        selectedItems: selectedFood,
        equipment,
      })
      if ('error' in result) setError(result.error || 'The reservation could not be submitted.')
      else {
        setReservationId(result.reservationId)
        setStep(6)
        setMessage('Reservation submitted with pending status.')
      }
    })
  }

  const uploadReceipt = () => {
    setError('')
    setMessage('')
    if (!reservationId) {
      setError('Submit the reservation before uploading a receipt.')
      return
    }
    if (!receipt) {
      setError('Choose a payment receipt file.')
      return
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
    if (!allowedTypes.includes(receipt.type)) {
      setError('Only JPEG, PNG, WebP, and PDF receipts are accepted.')
      return
    }
    if (receipt.size > 5 * 1024 * 1024) {
      setError('Receipt files must be 5 MB or smaller.')
      return
    }

    startTransition(async () => {
      const supabase = createClient()
      const { data: claims } = await supabase.auth.getClaims()
      if (!claims?.claims) {
        setError('Please log in before uploading a receipt.')
        return
      }
      const userId = claims.claims.sub as string
      const extension = receipt.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg'
      const path = `${userId}/${Date.now()}-${crypto.randomUUID()}.${extension}`

      const { error: uploadError } = await supabase.storage
        .from('payment-receipts')
        .upload(path, receipt, { contentType: receipt.type, upsert: false })

      if (uploadError) {
        setError('Receipt upload failed. Please try again.')
        return
      }

      const result = await attachReservationReceipt(reservationId, path)
      if ('error' in result) setError(result.error || 'The receipt could not be attached.')
      else setMessage('Receipt uploaded. Payment is pending verification.')
    })
  }

  const steps = ['Guest', 'Package', 'Food', 'Equipment', 'Review', 'Receipt']

  return (
    <section className="content-section">
      <p className="eyebrow">RESERVE YOUR CELEBRATION</p>
      <h1 className="page-title">Plan your event</h1>

      <div className="pill-row">
        {steps.map((item, index) => (
          <button type="button" key={item} className={`pill ${step >= index + 1 ? 'active' : ''}`} onClick={() => setStep(index + 1)}>
            {index + 1} · {item}
          </button>
        ))}
      </div>

      <div className="form-layout">
        <div className="form-card">
          {step === 1 && (
            <>
              <h2>Guest details</h2>
              <div className="field"><label htmlFor="eventType">Event type</label><input id="eventType" value={eventType} onChange={(event) => setEventType(event.target.value)} required /></div>
              <div className="field"><label htmlFor="guestCount">Number of guests</label><input id="guestCount" type="number" min={1} max={5000} value={guestCount} onChange={(event) => setGuestCount(Number(event.target.value))} /></div>
              <div className="field"><label htmlFor="eventDate">Event date</label><input id="eventDate" type="date" value={eventDate} min={new Date().toISOString().slice(0, 10)} onChange={(event) => setEventDate(event.target.value)} /></div>
              <div className="field"><label htmlFor="eventTime">Event time</label><input id="eventTime" type="time" value={eventTime} onChange={(event) => setEventTime(event.target.value)} /></div>
            </>
          )}

          {step === 2 && (
            <>
              <h2>Select a package</h2>
              {packages.length === 0 ? <p style={{ color: '#887E74' }}>No active packages are available.</p> : packages.map((item) => (
                <button type="button" key={item.id} className={`pill ${packageId === item.id ? 'active' : ''}`} style={{ display: 'block', width: '100%', marginBottom: 8, textAlign: 'left' }} onClick={() => setPackageId(item.id)}>
                  {item.name} — {item.price_per_person && item.price_per_person > 0 ? `₱${Number(item.price_per_person).toLocaleString()} per person` : 'Price unavailable'}
                </button>
              ))}
            </>
          )}

          {step === 3 && (
            <>
              <h2>Select food</h2>
              {foodOptions.map((item) => (
                <label key={item} className="pill" style={{ display: 'block', width: '100%', marginBottom: 8 }}>
                  <input type="checkbox" checked={selectedFood.includes(item)} onChange={() => toggle(item, selectedFood, setSelectedFood)} /> &nbsp; {item}
                </label>
              ))}
            </>
          )}

          {step === 4 && (
            <>
              <h2>Select equipment</h2>
              {equipmentOptions.map((item) => (
                <label key={item} className="pill" style={{ display: 'block', width: '100%', marginBottom: 8 }}>
                  <input type="checkbox" checked={equipment.includes(item)} onChange={() => toggle(item, equipment, setEquipment)} /> &nbsp; {item}
                </label>
              ))}
            </>
          )}

          {step === 5 && (
            <>
              <h2>Review reservation</h2>
              <p><strong>Package:</strong> {selectedPackage?.name || 'Catering package'}</p>
              <p><strong>Guests:</strong> {guestCount}</p>
              <p><strong>Food:</strong> {selectedFood.join(', ') || 'No selections'}</p>
              <p><strong>Equipment:</strong> {equipment.join(', ') || 'No selections'}</p>
              <p><strong>Date:</strong> {eventDate} at {eventTime}</p>
              <p><strong>Server-validated package total:</strong> ₱{total.toLocaleString()}</p>
            </>
          )}

          {step === 6 && (
            <>
              <h2>Payment receipt</h2>
              <p style={{ color: '#887E74' }}>Upload JPEG, PNG, WebP, or PDF. Maximum size: 5 MB.</p>
              <div className="field"><label htmlFor="receipt">Receipt file</label><input id="receipt" type="file" accept="image/jpeg,image/png,image/webp,application/pdf" onChange={(event) => setReceipt(event.target.files?.[0] || null)} /></div>
              <button type="button" className="primary" disabled={loading || !reservationId} onClick={uploadReceipt}>{loading ? 'Uploading…' : 'Upload receipt'}</button>
              {reservationId ? <p style={{ marginTop: 12, fontSize: 13 }}>Reservation #{reservationId}</p> : null}
            </>
          )}

          {error ? <p style={{ color: '#9B3E32', fontSize: 13, marginTop: 12 }}>{error}</p> : null}
          {message ? <p style={{ color: '#466657', fontSize: 13, marginTop: 12 }}>{message}</p> : null}

          {step < 6 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginTop: 24 }}>
              <button type="button" className="pill" onClick={() => setStep(Math.max(1, step - 1))}>Previous</button>
              {step === 5 ? (
                <button type="button" className="primary" disabled={loading} onClick={submitReservation}>{loading ? 'Submitting…' : 'Submit reservation'}</button>
              ) : (
                <button type="button" className="primary" onClick={() => setStep(step + 1)}>Continue</button>
              )}
            </div>
          )}
        </div>

        <aside className="form-card" style={{ background: '#38251D', color: 'white', height: 'fit-content' }}>
          <p className="eyebrow">YOUR SELECTION</p>
          <h2 style={{ fontFamily: 'Georgia' }}>{selectedPackage?.name || 'Catering package'}</h2>
          <hr style={{ border: 0, borderTop: '1px solid #59483f', margin: '20px 0' }} />
          <p style={{ display: 'flex', justifyContent: 'space-between' }}><span>Guests</span><strong>{guestCount}</strong></p>
          <p style={{ display: 'flex', justifyContent: 'space-between' }}><span>Estimated total</span><strong>₱{total.toLocaleString()}</strong></p>
        </aside>
      </div>
    </section>
  )
}
