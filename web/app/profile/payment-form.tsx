'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { removeUnreferencedPaymentProof, submitReservationPayment } from '../actions'

type PaymentType = 'down_payment' | 'full_payment' | 'balance_payment'
type PaymentMethod = 'cash' | 'gcash_in_person' | 'maya_in_person'

export default function CustomerPaymentForm({ reservationId, reservationTotal, verifiedTotal, pendingTotal, downPaymentAvailable, defaultOpen = false }: {
  reservationId: number
  reservationTotal: number
  verifiedTotal: number
  pendingTotal: number
  downPaymentAvailable: boolean
  defaultOpen?: boolean
}) {
  const [paymentType, setPaymentType] = useState<PaymentType>(downPaymentAvailable ? 'down_payment' : 'balance_payment')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash')
  const [balanceAmount, setBalanceAmount] = useState('')
  const [referenceNumber, setReferenceNumber] = useState('')
  const [proof, setProof] = useState<File | null>(null)
  const [requestKeyState, setRequestKeyState] = useState<string | null>(null)
  const [uploadedProofPath, setUploadedProofPath] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const router = useRouter()

  const remainingBalance = reservationTotal - verifiedTotal
  const availableToSubmit = remainingBalance - pendingTotal
  const activePaymentType = !downPaymentAvailable && paymentType === 'down_payment' ? 'balance_payment' : paymentType
  const calculatedAmount = activePaymentType === 'down_payment'
    ? Math.round((reservationTotal * 0.5 + Number.EPSILON) * 100) / 100
    : activePaymentType === 'full_payment'
      ? availableToSubmit
      : Number(balanceAmount)
  const requiresProof = paymentMethod !== 'cash'
  const currency = (amount: number) => `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

    if (availableToSubmit <= 0) {
      setError('This reservation has no remaining balance.')
      return
    }
    if (calculatedAmount <= 0 || !Number.isFinite(calculatedAmount) || calculatedAmount > availableToSubmit) {
      setError('Enter an amount that does not exceed the available balance after pending submissions.')
      return
    }
    if (requiresProof && !proof) {
      setError('Upload payment proof for an in-person GCash or Maya payment.')
      return
    }
    if (proof) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
      if (!allowedTypes.includes(proof.type) || proof.size > 5 * 1024 * 1024) {
        setError('Use a JPEG, PNG, WebP, or PDF file no larger than 5 MB.')
        return
      }
    }

    setBusy(true)
    try {
      const requestKey = requestKeyState || crypto.randomUUID()
      setRequestKeyState(requestKey)
      let receiptPath = uploadedProofPath
      if (proof && !receiptPath) {
        const supabase = createClient()
        const { data: claims, error: claimsError } = await supabase.auth.getClaims()
        if (claimsError || !claims?.claims) {
          setError('Please log in again before uploading payment proof.')
          return
        }
        const userId = claims.claims.sub as string
        const extension = proof.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg'
        receiptPath = `${userId}/payments/${requestKey}.${extension}`
        const { error: uploadError } = await supabase.storage
          .from('payment-receipts')
          .upload(receiptPath, proof, { contentType: proof.type, upsert: false })
        if (uploadError) {
          setError('Payment proof could not be uploaded. Please try again.')
          return
        }
        setUploadedProofPath(receiptPath)
      }

      const result = await submitReservationPayment({
        reservationId,
        paymentType: activePaymentType,
        paymentMethod,
        requestedAmount: activePaymentType === 'balance_payment' ? calculatedAmount : null,
        receiptPath,
        referenceNumber,
        requestKey,
      })
      if ('error' in result) {
        const cleanup = receiptPath ? await removeUnreferencedPaymentProof(receiptPath) : null
        const cleanupMessage = cleanup && 'error' in cleanup
          ? ' Uploaded proof could not be cleaned up and was left untouched for safety.'
          : cleanup && 'success' in cleanup && cleanup.referenced
            ? ' The proof is referenced by a payment record and was not deleted.'
            : ''
        setError(`${result.error || 'The payment could not be submitted.'}${cleanupMessage}`)
        if (cleanup && ('error' in cleanup || ('success' in cleanup && cleanup.referenced))) {
          setUploadedProofPath(receiptPath)
          if ('success' in cleanup && cleanup.referenced) router.refresh()
          return
        }
        setRequestKeyState(null)
        setUploadedProofPath(null)
        return
      }

      setReferenceNumber('')
      setBalanceAmount('')
      setProof(null)
      setRequestKeyState(null)
      setUploadedProofPath(null)
      router.refresh()
    } catch {
      setError('The payment could not be submitted. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  if (remainingBalance <= 0) {
    return <p className="payment-settled">This reservation has no remaining balance.</p>
  }

  return (
    <details className="customer-payment-form" open={defaultOpen || undefined}>
      <summary>Submit an in-person payment</summary>
      <p className="payment-instructions">After paying at the venue, submit the payment details for staff verification. No online payment is taken here.</p>
      <form onSubmit={submit}>
        <div className="payment-form-grid">
          <div className="field">
            <label htmlFor={`payment-type-${reservationId}`}>Payment amount</label>
            <select id={`payment-type-${reservationId}`} disabled={!!requestKeyState} value={activePaymentType} onChange={(event) => setPaymentType(event.target.value as PaymentType)}>
              <option value="down_payment" disabled={!downPaymentAvailable}>50% down payment{downPaymentAvailable ? '' : ' (already submitted)'}</option>
              <option value="full_payment">Pay available balance in full</option>
              <option value="balance_payment">Additional balance payment</option>
            </select>
          </div>
          {!downPaymentAvailable ? <p className="payment-instructions">A down payment has already been submitted or recorded for this reservation. Choose full payment or an additional balance payment.</p> : null}
          {activePaymentType === 'balance_payment' ? (
            <div className="field">
              <label htmlFor={`balance-amount-${reservationId}`}>Amount (up to {currency(availableToSubmit)})</label>
              <input id={`balance-amount-${reservationId}`} type="number" min="0.01" max={availableToSubmit.toFixed(2)} step="0.01" required disabled={!!requestKeyState} value={balanceAmount} onChange={(event) => setBalanceAmount(event.target.value)} />
            </div>
          ) : null}
          <div className="field">
            <label htmlFor={`payment-method-${reservationId}`}>In-person method</label>
            <select id={`payment-method-${reservationId}`} disabled={!!requestKeyState} value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value as PaymentMethod)}>
              <option value="cash">Cash at the venue</option>
              <option value="gcash_in_person">GCash paid in person</option>
              <option value="maya_in_person">Maya paid in person</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor={`payment-reference-${reservationId}`}>Payment reference (optional)</label>
            <input id={`payment-reference-${reservationId}`} maxLength={100} disabled={!!requestKeyState} value={referenceNumber} onChange={(event) => setReferenceNumber(event.target.value)} />
          </div>
          <div className="field payment-proof-field">
            <label htmlFor={`payment-proof-${reservationId}`}>{requiresProof ? 'Payment proof (required)' : 'Payment proof (optional)'}</label>
            <input id={`payment-proof-${reservationId}`} type="file" accept="image/jpeg,image/png,image/webp,application/pdf" required={requiresProof} disabled={!!requestKeyState} onChange={(event) => setProof(event.target.files?.[0] || null)} />
          </div>
        </div>
        <p className="payment-amount-preview">Payment to submit: <strong>{currency(calculatedAmount || 0)}</strong></p>
        <p className="payment-balance-preview">Remaining balance (verified payments): <strong>{currency(remainingBalance)}</strong></p>
        {pendingTotal > 0 ? <p className="payment-balance-preview">Awaiting verification: <strong>{currency(pendingTotal)}</strong></p> : null}
        <p className="payment-balance-preview">Available for a new submission: <strong>{currency(availableToSubmit)}</strong></p>
        {error ? <p className="form-error" role="alert">{error}</p> : null}
        <button type="submit" className="primary" disabled={busy || calculatedAmount <= 0 || calculatedAmount > availableToSubmit}>
          {busy ? 'Submitting…' : 'Submit payment for verification'}
        </button>
      </form>
    </details>
  )
}