import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  let packages: Array<{
    id: number;
    name: string;
    price_per_person: number | null;
    description: string | null;
  }> = [];
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("packages")
      .select("id, name, price_per_person, description")
      .eq("active", true)
      .order("price_per_person", { ascending: true })
      .limit(3);
    packages = data || [];
  } catch {
    packages = [];
  }

  return (
    <>
      <section className="hero-shell">
        <div className="hero">
          <img
            src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1600&q=85"
            alt="Elegant celebration table"
          />
          <div className="hero-shade" />
          <div className="hero-copy">
            <p className="eyebrow light">CELEBRATE WITH US</p>
            <h1>Every celebration deserves something special.</h1>
            <p>
              Food, venue, and thoughtful service brought together for gatherings
              worth remembering.
            </p>
            <div className="hero-actions">
              <Link
                href="/booking"
                className="button gold"
              >
                Book an event
              </Link>
              <Link
                href="/packages"
                className="button outline"
              >
                Explore packages
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="intro section">
        <div>
          <p className="eyebrow">WELCOME TO ROBERTO&apos;S PLACE</p>
          <h2>Making your special moments memorable.</h2>
        </div>
        <p className="intro-copy">
          From intimate gatherings to milestone celebrations, our team brings
          elegant spaces, generous flavors, and attentive service together in one
          seamless experience.
        </p>
      </section>

      <section className="services">
        <article>
          <span>01</span>
          <h3>Catering</h3>
          <p>
            Thoughtfully prepared menus for intimate dinners and grand
            celebrations.
          </p>
        </article>
        <article>
          <span>02</span>
          <h3>Party Packages</h3>
          <p>Complete package options for a beautifully planned event.</p>
        </article>
        <article>
          <span>03</span>
          <h3>Venue Hosting</h3>
          <p>Elegant spaces for moments shared with the people you love.</p>
        </article>
      </section>

      <section className="feature section">
        <img
          src="https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=85"
          alt="Celebration dishes"
        />
        <div>
          <p className="eyebrow">CURATED FOR YOUR TABLE</p>
          <h2>
            Generous dishes. Familiar favorites. Beautifully served.
          </h2>
          <p>
            Explore classic Filipino dishes and celebration favorites prepared
            for sharing.
          </p>
          <Link href="/menu" className="text-link">
            View food menu →
          </Link>
        </div>
      </section>

      <section className="packages-preview">
        <div className="section-heading">
          <div>
            <p className="eyebrow">POPULAR CHOICES</p>
            <h2>Featured packages</h2>
          </div>
          <Link href="/packages" className="text-link">
            View all packages →
          </Link>
        </div>
        <div className="package-grid">
          {packages?.map(({ id, name, price_per_person, description }) => (
            <article key={id}>
              <h3>{name}</h3>
              <strong>{price_per_person && price_per_person > 0 ? `₱${Number(price_per_person).toLocaleString()}` : 'Price unavailable'}</strong>
              <p>{description}</p>
              <Link href="/packages">View package →</Link>
            </article>
          ))}
        </div>
      </section>

      <section className="cta">
        <div>
          <p className="eyebrow light">START PLANNING</p>
          <h2>Let&apos;s plan your next celebration.</h2>
        </div>
        <Link href="/inquiry" className="button gold">
          Send an inquiry
        </Link>
      </section>
    </>
  );
}
