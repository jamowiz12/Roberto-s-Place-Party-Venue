
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

  const events = [
    {
      number: "01",
      title: "Birthdays",
      description:
        "Celebrate another year with delicious food and the people who matter most.",
    },
    {
      number: "02",
      title: "Weddings",
      description:
        "Make your special day memorable with food and service for your celebration.",
    },
    {
      number: "03",
      title: "Anniversaries",
      description:
        "Bring family and friends together to celebrate meaningful milestones.",
    },
    {
      number: "04",
      title: "Family Gatherings",
      description:
        "Enjoy good food and quality moments with family and loved ones.",
    },
  ];

  return (
    <>
      <section className="hero-shell">
        <div className="hero">
          <img
            src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1600&q=85"
            alt="Elegant event celebration setup"
          />

          <div className="hero-shade" />

          <div className="hero-copy">
            <p className="eyebrow light">
              ROBERTO&apos;S PLACE PARTY VENUE & CATERING
            </p>

            <h1>Make Every Celebration Worth Remembering.</h1>

            <p>
              Celebrate your special occasions with delicious food,
              thoughtful service, and packages made for sharing.
            </p>

            <div className="hero-actions">
              <Link href="/booking" className="button gold">
                Book Now
              </Link>

              <Link href="/packages" className="button outline">
                Explore Packages
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="intro section">
        <div>
          <p className="eyebrow">WELCOME TO ROBERTO&apos;S PLACE</p>

          <h2>Your celebration starts with a great experience.</h2>
        </div>

        <div className="intro-copy">
          <p>
            Whether it is a birthday, wedding, anniversary, or family
            gathering, Roberto&apos;s Place is here to help make your
            occasion special.
          </p>

          <p>
            Choose your catering package, select your favorite dishes,
            and let us help you plan your event.
          </p>
        </div>
      </section>

      <section className="content-section" id="events">
        <p className="eyebrow">CELEBRATE WITH US</p>

        <h2 className="page-title">Events We Cater For</h2>

        <p style={{ color: "#887E74", maxWidth: 600, lineHeight: 1.8 }}>
          From intimate gatherings to special milestones, we help bring
          people together through good food and memorable celebrations.
        </p>

        <div className="services">
          {events.map((event) => (
            <article key={event.number}>
              <span>{event.number}</span>
              <h3>{event.title}</h3>
              <p>{event.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="packages-preview">
        <div className="section-heading">
          <div>
            <p className="eyebrow">CATERING PACKAGES</p>
            <h2>Good food for every occasion.</h2>
          </div>

          <Link href="/packages" className="text-link">
            View All Packages {"\u2192"}
          </Link>
        </div>

        <div className="intro section" style={{ padding: "24px 0" }}>
          <div>
            <p className="eyebrow">STARTING PACKAGE</p>
            <h2>
              {"\u20B1"}300{" "}
              <span style={{ fontSize: 16, fontWeight: 400 }}>
                per person
              </span>
            </h2>
          </div>

          <div className="intro-copy">
            <p>Our starting catering package includes:</p>
            <ul>
              <li>2 meat/protein dishes</li>
              <li>1 pasta or vegetable dish</li>
              <li>Rice</li>
              <li>Fresh fruit</li>
              <li>Drinks</li>
            </ul>
          </div>
        </div>

        {packages.length > 0 ? (
          <div className="package-grid">
            {packages.map((item) => (
              <article key={item.id}>
                <h3>{item.name}</h3>

                <strong>
                  {item.price_per_person && item.price_per_person > 0
                    ? `\u20B1${Number(item.price_per_person).toLocaleString()} / person`
                    : "Price unavailable"}
                </strong>

                <p>{item.description}</p>

                <Link href="/packages">
                  View Package {"\u2192"}
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <p style={{ color: "#887E74", marginTop: 20 }}>
            Contact us to learn more about our available catering packages.
          </p>
        )}

        <div style={{ marginTop: 28 }}>
          <Link href="/packages" className="button gold">
            Explore Catering Packages
          </Link>
        </div>
      </section>

      <section className="cta">
        <div>
          <p className="eyebrow light">PLAN YOUR CELEBRATION</p>
          <h2>Ready to book your next event?</h2>
        </div>

        <Link href="/booking" className="button gold">
          Book Your Event
        </Link>
      </section>
    </>
  );
}
