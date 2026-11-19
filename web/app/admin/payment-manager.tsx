'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  createPaymentAcknowledgmentSignedUrl,
  createPaymentProofSignedUrl,
  recordAdminReservationPayment,
  regeneratePaymentAcknowledgment,
  verifyReservationPayment,
} from '../actions'
import type { AdminReservation } from './admin-client'

export type AdminPaymentRow = {
  id: number
  reservation_id: number
  customer_id: string
  amount: number
  payment_method: string
  payment_type: string
  status: string
  receipt_path: string | null
  reference_number: string | null
  acknowledgment_reference: string | null
  acknowledgment_path: string | null
  verified_by: string | null
  verified_at: string | null
  created_at: string
}

export type PaymentAuditRow = {
  id: number
  payment_id: number | null
  actor_id: string | null
  action: string
  previous_value: unknown
  new_value: unknown
  reason: string | null
  created_at: string
}

type PaymentMethod = 'cash' | 'gcash_in_person' | 'maya_in_person'
type PaymentType = 'down_payment' | 'full_payment' | 'balance_payment'

const methodLabels: Record<string, string> = {
  cash: 'Cash at venue',
  gcash_in_person: 'GCash in person',
  maya_in_person: 'Maya in person',
}

const typeLabels: Record<string, string> = {
  down_payment: '50% down payment',
  full_payment: 'Full payment',
  balance_payment: 'Balance payment',
}

const statusLabels: Record<string, string> = {
  pending_verification: 'Awaiting verification',
  verified: 'Verified',
  rejected: 'Rejected',
}

export default function PaymentManager({ reservations, payments, paymentAudit, paymentLedgerAvailable }: {
  reservations: AdminReservation[]
  payments: AdminPaymentRow[]
  paymentAudit: PaymentAuditRow[]
  paymentLedgerAvailable: boolean
}) {
  const [methodFilter, setMethodFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [reason, setReason] = useState('')
  const [reservationId, setReservationId] = useState('')
  const [paymentType, setPaymentType] = useState<PaymentType>('down_payment')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash')
  const [amount, setAmount] = useState('')
  const [referenceNumber, setReferenceNumber] = useState('')
  const [recordReason, setRecordReason] = useState('')
  const [recordRequestKey, setRecordRequestKey] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [proofPending, setProofPending] = useState<number | null>(null)
  const [ackPending, setAckPending] = useState<number | null>(null)
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  const filteredPayments = useMemo(() => payments.filter((payment) => (
    (methodFilter === 'all' || payment.payment_method === methodFilter)
    && (statusFilter === 'all' || payment.status === statusFilter)
  )), [payments, methodFilter, statusFilter])

  const reservationById = new Map(reservations.map((reservation) => [reservation.id, reservation]))
  const verifiedByReservation = new Map<number, number>()
  const pendingByReservation = new Map<number, number>()
  for (const payment of payments) {
    if (payment.status === 'verified') {
      verifiedByReservation.set(payment.reservation_id, (verifiedByReservation.get(payment.reservation_id) || 0) + Number(payment.amount))
    } else if (payment.status === 'pending_verification') {
      pendingByReservation.set(payment.reservation_id, (pendingByReservation.get(payment.reservation_id) || 0) + Number(payment.amount))
    }
  }

  const currency = (value: number) => `₱${value.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  const bookingRemaining = (item: AdminReservation) => Number(item.total) - (verifiedByReservation.get(item.id) || 0)
  const availableToRecord = (item: AdminReservation) => bookingRemaining(item) - (pendingByReservation.get(item.id) || 0)
  const hasPaymentActivity = (item: AdminReservation) => (verifiedByReservation.get(item.id) || 0) > 0 || (pendingByReservation.get(item.id) || 0) > 0
  const selectedReservation = reservations.find((item) => String(item.id) === reservationId)
  const selectedHasPaymentActivity = selectedReservation ? hasPaymentActivity(selectedReservation) : false
  const selectedIsHistoricalPaid = selectedReservation?.payment_status === 'paid' && !payments.some((payment) => payment.reservation_id === selectedReservation.id)
  const activePaymentType = (selectedHasPaymentActivity || selectedIsHistoricalPaid) && paymentType === 'down_payment'
    ? 'balance_payment'
    : paymentType
  const displayName = (payment: AdminPaymentRow) => reservationById.get(payment.reservation_id)?.profiles?.full_name || 'Customer'

  const downloadAcknowledgment = async (paymentId: number) => {
    setError('')
    setAckPending(paymentId)
    try {
      const result = await createPaymentAcknowledgmentSignedUrl(paymentId)
      if ('error' in result) setError(result.error || 'The acknowledgment could not be downloaded.')
      else window.open(result.signedUrl, '_blank', 'noopener,noreferrer')
    } catch {
      setError('The acknowledgment could not be downloaded. Please try again.')
    } finally {
      setAckPending(null)
    }
  }

  const openProof = async (paymentId: number) => {
    setError('')
    setProofPending(paymentId)
    try {
      const result = await createPaymentProofSignedUrl(paymentId)
      if ('error' in result) setError(result.error || 'The proof could not be opened.')
      else window.open(result.signedUrl, '_blank', 'noopener,noreferrer')
    } catch {
      setError('The proof could not be opened. Please try again.')
    } finally {
      setProofPending(null)
    }
  }

  const decide = (paymentId: number, decision: 'verified' | 'rejected') => {
    if (reason.trim().length < 3) {
      setError('Enter an audit reason of at least 3 characters before reviewing a payment.')
      return
    }
    if (!window.confirm(decision === 'verified' ? 'Verify this payment?' : 'Reject this payment?')) return
    setError('')
    setMessage('')
    startTransition(async () => {
      try {
        const result = await verifyReservationPayment({ paymentId, decision, reason })
        if ('error' in result) setError(result.error || 'The payment could not be updated.')
        else {
          setMessage(decision === 'verified' ? 'Payment verified and acknowledgment generated.' : 'Payment rejected.')
          router.refresh()
        }
      } catch {
        setError('The payment could not be updated. Please try again.')
      }
    })
  }

  const recordPayment = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setMessage('')
    if (!reservationId) {
      setError('Choose a reservation.')
      return
    }
    if (recordReason.trim().length < 3) {
      setError('Enter an audit reason of at least 3 characters.')
      return
    }

    const requestKey = recordRequestKey || crypto.randomUUID()
    setRecordRequestKey(requestKey)
    startTransition(async () => {
      try {
        const result = await recordAdminReservationPayment({
          reservationId: Number(reservationId),
          amount: activePaymentType === 'balance_payment' ? Number(amount) : null,
          paymentType: activePaymentType,
          paymentMethod,
          referenceNumber,
          reason: recordReason,
          requestKey,
        })
        if ('error' in result) setError(result.error || 'The payment could not be recorded.')
        else {
          setMessage('Payment recorded and acknowledgment generated.')
          setAmount('')
          setReferenceNumber('')
          setRecordReason('')
          setRecordRequestKey(null)
          router.refresh()
        }
      } catch {
        setError('The payment could not be recorded. Please try again.')
      }
    })
  }

  const regenerateAcknowledgment = (paymentId: number) => {
    setError('')
    setAckPending(paymentId)
    startTransition(async () => {
      try {
        const result = await regeneratePaymentAcknowledgment(paymentId)
        if ('error' in result) setError(result.error || 'Acknowledgment generation failed.')
        else {
          setMessage('Payment acknowledgment is available.')
          router.refresh()
        }
      } catch {
        setError('Acknowledgment generation failed. Please try again.')
      } finally {
        setAckPending(null)
      }
    })
  }

  return (
    <section className="payment-manager">
      <div className="payment-manager-heading">
        <div>
          <p className="eyebrow">PAYMENT MANAGEMENT</p>
          <h2>Payments</h2>
          <p>Review in-person submissions and record payments received at the venue.</p>
        </div>
      </div>

      {!paymentLedgerAvailable ? (
        <div className="info-card payment-unavailable" role="status">
          Payment management is unavailable until the reviewed Supabase migration is applied.
        </div>
      ) : <>

      {error ? <p className="form-error" role="alert">{error}</p> : null}
      {message ? <p className="form-success" role="status">{message}</p> : null}

      <form className="admin-payment-entry form-card" onSubmit={recordPayment}>
        <h3>Record payment received</h3>
        <p>For cash, GCash, or Maya payments received in person. Recording a payment verifies it immediately.</p>
        <div className="payment-form-grid">
          <div className="field">
            <label htmlFor="admin-payment-reservation">Reservation</label>
            <select id="admin-payment-reservation" required value={reservationId} onChange={(event) => {
              const nextReservationId = event.target.value
              const nextReservation = reservations.find((item) => String(item.id) === nextReservationId)
              setReservationId(nextReservationId)
              if (nextReservation && hasPaymentActivity(nextReservation) && paymentType === 'down_payment') setPaymentType('balance_payment')
            }}>
              <option value="">Select reservation</option>
              {reservations.map((item) => (
                <option key={item.id} value={item.id}>
                  #{item.id} · {item.profiles?.full_name || 'Customer'} · available {currency(availableToRecord(item))}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="admin-payment-type">Payment type</label>
            <select id="admin-payment-type" value={activePaymentType} onChange={(event) => setPaymentType(event.target.value as PaymentType)}>
              <option value="down_payment" disabled={!selectedReservation || selectedHasPaymentActivity || selectedIsHistoricalPaid}>50% down payment{selectedHasPaymentActivity ? ' (already submitted)' : ''}</option>
              <option value="full_payment">Pay remaining balance in full</option>
              <option value="balance_payment">Additional balance payment</option>
            </select>
          </div>
          {activePaymentType === 'balance_payment' ? (
            <div className="field">
              <label htmlFor="admin-payment-amount">Amount</label>
              <input id="admin-payment-amount" type="number" min="0.01" step="0.01" required value={amount} onChange={(event) => setAmount(event.target.value)} />
            </div>
          ) : null}
          <div className="field">
            <label htmlFor="admin-payment-method">Method received</label>
            <select id="admin-payment-method" value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value as PaymentMethod)}>
              <option value="cash">Cash at venue</option>
              <option value="gcash_in_person">GCash paid in person</option>
              <option value="maya_in_person">Maya paid in person</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="admin-payment-reference">Payment reference (optional)</label>
            <input id="admin-payment-reference" maxLength={100} value={referenceNumber} onChange={(event) => setReferenceNumber(event.target.value)} />
          </div>
        </div>
        <div className="field">
          <label htmlFor="admin-record-reason">Audit reason</label>
          <input id="admin-record-reason" required minLength={3} maxLength={500} value={recordReason} onChange={(event) => setRecordReason(event.target.value)} />
        </div>
        {selectedHasPaymentActivity ? <p className="payment-instructions">A verified or pending payment already exists. Choose full payment or an additional balance payment.</p> : null}
        {selectedIsHistoricalPaid ? <p className="payment-instructions">This reservation is marked paid in the existing records. No additional ledger payment can be recorded.</p> : null}
        <button type="submit" className="primary" disabled={pending || !reservationId || selectedIsHistoricalPaid}>Record verified payment</button>
      </form>

      <div className="payment-review-controls">
        <div className="field">
          <label htmlFor="payment-method-filter">Filter by method</label>
          <select id="payment-method-filter" value={methodFilter} onChange={(event) => setMethodFilter(event.target.value)}>
            <option value="all">All methods</option>
            <option value="cash">Cash</option>
            <option value="gcash_in_person">GCash in person</option>
            <option value="maya_in_person">Maya in person</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="payment-status-filter">Filter by status</label>
          <select id="payment-status-filter" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="all">All statuses</option>
            <option value="pending_verification">Awaiting verification</option>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <div className="field payment-reason-field">
          <label htmlFor="payment-audit-reason">Review / adjustment reason</label>
          <input id="payment-audit-reason" value={reason} maxLength={500} onChange={(event) => setReason(event.target.value)} placeholder="Required for every admin action" />
        </div>
      </div>

      <h3 className="payment-subheading">All payment records ({filteredPayments.length})</h3>
      {filteredPayments.length === 0 ? (
        <div className="info-card empty-state"><p>No payment records match these filters.</p></div>
      ) : (
        <div className="table-wrap payment-table-wrap">
          <table className="data-table payment-table">
            <thead><tr><th>Payment</th><th>Customer / reservation</th><th>Amount / balance</th><th>Method / type</th><th>Status</th><th>Proof / acknowledgment</th><th>Actions</th></tr></thead>
            <tbody>
              {filteredPayments.map((payment) => {
                const reservation = reservationById.get(payment.reservation_id)
                const balance = reservation ? Number(reservation.total) - (verifiedByReservation.get(reservation.id) || 0) : null
                const available = reservation ? availableToRecord(reservation) : null
                return (
                  <tr key={payment.id}>
                    <td data-label="Payment">#{payment.id}<br /><small>{new Date(payment.created_at).toLocaleString()}</small></td>
                    <td data-label="Customer / reservation">{displayName(payment)}<br /><small>Reservation #{payment.reservation_id}</small></td>
                    <td data-label="Amount / balance"><strong>{currency(Number(payment.amount))}</strong><br /><small>{balance === null ? 'Balance unavailable' : `Remaining after verified ${currency(balance)}`}<br />{available === null ? '' : `Available after pending ${currency(available)}`}</small></td>
                    <td data-label="Method / type">{methodLabels[payment.payment_method] || payment.payment_method}<br /><small>{typeLabels[payment.payment_type] || payment.payment_type}</small></td>
                    <td data-label="Status"><span className={`status-badge status-${payment.status}`}>{statusLabels[payment.status] || payment.status}</span>{payment.acknowledgment_reference ? <small className="ack-ref">{payment.acknowledgment_reference}</small> : null}</td>
                    <td data-label="Proof / acknowledgment">
                      <div className="admin-actions">
                        {payment.receipt_path ? <button type="button" className="pill" disabled={proofPending === payment.id} onClick={() => openProof(payment.id)}>{proofPending === payment.id ? 'Opening…' : 'View proof'}</button> : <small>No uploaded proof</small>}
                        {payment.status === 'verified' && payment.acknowledgment_path ? <button type="button" className="pill" disabled={ackPending === payment.id} onClick={() => downloadAcknowledgment(payment.id)}>{ackPending === payment.id ? 'Preparing…' : 'Download acknowledgment'}</button> : null}
                        {payment.status === 'verified' && !payment.acknowledgment_path ? <button type="button" className="pill" disabled={ackPending === payment.id} onClick={() => regenerateAcknowledgment(payment.id)}>{ackPending === payment.id ? 'Generating…' : 'Generate acknowledgment'}</button> : null}
                      </div>
                    </td>
                    <td data-label="Actions">
                      {payment.status === 'pending_verification' ? <div className="admin-actions">
                        <button type="button" className="pill action-approve" disabled={pending} onClick={() => decide(payment.id, 'verified')}>Verify payment</button>
                        <button type="button" className="pill action-reject" disabled={pending} onClick={() => decide(payment.id, 'rejected')}>Reject payment</button>
                      </div> : <small>{payment.verified_at ? `Verified ${new Date(payment.verified_at).toLocaleDateString()}` : 'No action available'}</small>}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <details className="payment-audit-history">
        <summary>Payment audit history ({paymentAudit.length})</summary>
        {paymentAudit.length === 0 ? <p className="payment-empty">No payment audit entries.</p> : (
          <div className="table-wrap payment-table-wrap">
            <table className="data-table payment-table">
              <thead><tr><th>Time</th><th>Payment</th><th>Action / actor</th><th>Previous value</th><th>New value</th><th>Reason</th></tr></thead>
              <tbody>{paymentAudit.map((entry) => (
                <tr key={entry.id}>
                  <td data-label="Time">{new Date(entry.created_at).toLocaleString()}</td>
                  <td data-label="Payment">
                    {entry.payment_id === null ? 'Legacy receipt' : `#${entry.payment_id}`}
                  </td>
                  <td data-label="Action / actor">{entry.action}<br /><small>{entry.actor_id || 'System'}</small></td>
                  <td data-label="Previous value"><code>{JSON.stringify(entry.previous_value)}</code></td>
                  <td data-label="New value"><code>{JSON.stringify(entry.new_value)}</code></td>
                  <td data-label="Reason">{entry.reason || '—'}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </details>
      </>}
    </section>
  )
}