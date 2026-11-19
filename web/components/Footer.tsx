import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-about"><strong className="footer-brand">ROBERTO&apos;S PLACE</strong><p>Party venue &amp; catering for celebrations worth remembering.</p></div>
        <div><strong>Explore</strong><Link href="/packages">Catering Packages</Link><Link href="/menu">Menu</Link><Link href="/#events">Events</Link></div>
        <div><strong>Customer Services</strong><Link href="/booking">Book an Event</Link><Link href="/profile">My Reservations</Link><Link href="/inquiry">Send an Inquiry</Link></div>
        <div><strong>Staff Access</strong><Link className="staff-login" href="/login">Staff / Admin Sign In</Link></div>
      </div>
      <div className="copyright">© 2026 Roberto&apos;s Place Party Venue</div>
    </footer>
  )
}
