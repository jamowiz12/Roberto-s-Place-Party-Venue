'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type Portal = 'customer' | 'admin'

export default function Login() {
	const [portal, setPortal] = useState<Portal | null>(null)
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [error, setError] = useState('')
	const [loading, setLoading] = useState(false)
	const router = useRouter()

	const submit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		if (!portal) return

		setLoading(true)
		setError('')

		try {
			const supabase = createClient()
			const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password })
			if (signInError || !data.user) {
				setError(signInError?.message || 'We could not verify your account. Please try again.')
				return
			}

			const { data: profile, error: profileError } = await supabase
				.from('profiles')
				.select('role')
				.eq('id', data.user.id)
				.single()

			if (profileError || !profile?.role || !['customer', 'admin'].includes(profile.role)) {
				const { error: signOutError } = await supabase.auth.signOut()
				setError(signOutError
					? 'We could not verify your account access, and the session could not be cleared. Please try again or contact the venue for help.'
					: 'We could not verify your account access. Your session has been signed out. Please contact the venue for help.')
				return
			}

			if (portal === 'admin' && profile.role !== 'admin') {
				const { error: signOutError } = await supabase.auth.signOut()
				setError(signOutError
					? 'This account does not have staff access. We could not clear the session; please try again or use the Customer Portal.'
					: 'This account does not have staff access. You have been signed out. Please choose the Customer Portal to manage reservations.')
				return
			}

			if (profile.role === 'admin') {
				router.replace('/admin')
				router.refresh()
				return
			}

			router.replace('/profile')
			router.refresh()
		} catch {
			setError('Sign in is temporarily unavailable. Please try again.')
		} finally {
			setLoading(false)
		}
	}

	return (
		<section className="content-section login-section">
			<div className="login-panel">
				{portal ? (
					<>
						<button type="button" className="back-link" onClick={() => { setPortal(null); setError('') }}>
							Back to portal selection
						</button>
						<p className="eyebrow">{portal === 'admin' ? 'STAFF ACCESS' : 'CUSTOMER ACCOUNT'}</p>
						<h1 className="page-title">{portal === 'admin' ? 'Admin Portal' : 'Customer Portal'}</h1>
						<p className="portal-description">
							{portal === 'admin'
								? 'Sign in with an authorized staff account to manage bookings and payments.'
								: 'Sign in to book events and manage your reservations.'}
						</p>
						<form onSubmit={submit}>
							<div className="field">
								<label htmlFor="email">Email address</label>
								<input id="email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
							</div>
							<div className="field">
								<label htmlFor="password">Password</label>
								<input id="password" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} />
							</div>
							{error ? <p className="form-error" role="alert">{error}</p> : null}
							<button className="primary login-submit" disabled={loading}>
								{loading ? 'Signing in…' : 'Sign in'}
							</button>
						</form>
						{portal === 'customer' ? (
							<p className="login-register">New here? <a href="/register">Create a customer account</a></p>
						) : null}
					</>
				) : (
					<>
						<p className="eyebrow">WELCOME BACK</p>
						<h1 className="page-title">Choose your portal</h1>
						<p className="portal-description">Select the account area you need to access.</p>
						<div className="portal-options">
							<button type="button" className="portal-option" onClick={() => setPortal('customer')}>
								<strong>Customer Portal</strong>
								<span>Book events and manage your reservations.</span>
							</button>
							<button type="button" className="portal-option" onClick={() => setPortal('admin')}>
								<strong>Admin Portal</strong>
								<span>Authorized staff can manage bookings and payments.</span>
							</button>
						</div>
						{error ? <p className="form-error" role="alert">{error}</p> : null}
					</>
				)}
			</div>
		</section>
	)
}
