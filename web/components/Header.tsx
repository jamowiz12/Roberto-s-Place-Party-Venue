
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  { href: "/", label: "Home" },
  { href: "/#events", label: "Events" },
  { href: "/packages", label: "Catering Packages" },
  { href: "/menu", label: "Menu" },
] as const;

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link
          href="/"
          className="brand"
          onClick={() => setOpen(false)}
        >
          <strong>ROBERTO&apos;S PLACE</strong>
          <span>PARTY VENUE &amp; CATERING</span>
        </Link>

        <button
          className="menu-toggle"
          onClick={() => setOpen(!open)}
          aria-label="Toggle navigation"
          aria-expanded={open}
        >
          {open ? "\u00D7" : "\u2630"}
        </button>

        <nav
          className={open ? "nav open" : "nav"}
          aria-label="Main navigation"
        >
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={
                pathname === href ||
                (href === "/#events" && pathname === "/")
                  ? "nav-link active"
                  : "nav-link"
              }
            >
              {label}
            </Link>
          ))}

          <Link
            href="/booking"
            onClick={() => setOpen(false)}
            className="nav-inquiry"
          >
            Book Now
          </Link>

          <Link
            href="/login"
            onClick={() => setOpen(false)}
            className={pathname === "/login" ? "nav-link active" : "nav-link"}
          >
            My Account
          </Link>
        </nav>
      </div>
    </header>
  );
}
