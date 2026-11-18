'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const links = [
  ['/','Home'], ['/packages','Packages'], ['/menu','Menu'], ['/gallery','Gallery'], ['/booking','Booking'], ['/profile','Profile'],
]

export default function Header() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  return (
    <header className="site-header">
      <div className="header-inner">
        <Link href="/" className="brand"><strong>ROBERTO&apos;S PLACE</strong><span>PARTY VENUE &amp; CATERING</span></Link>
        <button className="menu-toggle" onClick={() => setOpen(!open)} aria-label="Toggle navigation" aria-expanded={open}>{open ? '×' : '☰'}</button>
        <nav className={open ? 'nav open' : 'nav'} aria-label="Main navigation">
          {links.map(([href, label]) => <Link key={href} href={href} onClick={() => setOpen(false)} className={pathname === href ? 'nav-link active' : 'nav-link'}>{label}</Link>)}
          <Link href="/inquiry" onClick={() => setOpen(false)} className="nav-inquiry">Inquire</Link>
        </nav>
      </div>
    </header>
  )
}
