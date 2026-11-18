import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div><strong className="footer-brand">ROBERTO&apos;S PLACE</strong><p>Party venue &amp; catering for celebrations worth remembering.</p></div>
        <div><strong>Explore</strong><Link href="/packages">Packages</Link><Link href="/menu">Food menu</Link><Link href="/gallery">Gallery</Link></div>
        <div><strong>Plan</strong><Link href="/booking">Book an event</Link><Link href="/inquiry">Send an inquiry</Link><span>hello@robertosplace.com</span></div>
      </div>
      <div className="copyright">© 2026 Roberto&apos;s Place Party Venue</div>
    </footer>
  )
}
