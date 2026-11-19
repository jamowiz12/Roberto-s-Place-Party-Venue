
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

type PackageRow = {
  id: number;
  name: string;
  description: string | null;
  price_per_person: number | null;
  inclusions: unknown;
};

export default async function Packages() {
  let data: PackageRow[] | null = null;
  let error: unknown = null;

  try {
    const supabase = await createClient();

    const result = await supabase
      .from("packages")
      .select("id, name, description, price_per_person, inclusions")
      .eq("active", true)
      .order("price_per_person", { ascending: true });

    data = result.data;
    error = result.error;
  } catch {
    error = new Error("Supabase is not configured.");
  }

  const packages = error ? [] : data || [];

  return (
    <section className="content-section">
      <p className="eyebrow">ROBERTO&apos;S PLACE</p>

      <h1 className="page-title">Catering Packages</h1>

      <p style={{ color: "#887E74", maxWidth: 600, lineHeight: 1.8 }}>
        Choose a package for your celebration. Our starting package is
        {" \u20B1"}300 per person and includes food selections for sharing.
      </p>

      <div className="info-card" style={{ marginTop: 24 }}>
        <p className="eyebrow">STARTING PACKAGE</p>

        <h2 style={{ fontSize: 32, margin: "8px 0" }}>
          {"\u20B1"}300 / person
        </h2>

        <p style={{ color: "#887E74", lineHeight: 1.7 }}>
          Your starting package includes:
        </p>

        <ul style={{ lineHeight: 2 }}>
          <li>2 meat/protein dishes</li>
          <li>1 pasta or vegetable dish</li>
          <li>Rice</li>
          <li>Fresh fruit</li>
          <li>Drinks</li>
        </ul>
      </div>

      <h2 style={{ marginTop: 40 }}>Available Packages</h2>

      {packages.length === 0 ? (
        <div className="info-card" style={{ marginTop: 24 }}>
          <p style={{ color: "#887E74" }}>
            No active packages are currently available in the booking
            system. Please contact us for package inquiries.
          </p>

          <Link
            href="/inquiry"
            className="button gold"
            style={{ display: "inline-flex", marginTop: 16 }}
          >
            Send an Inquiry
          </Link>
        </div>
      ) : (
        <div className="cards-grid">
          {packages.map((item) => {
            const inclusions = Array.isArray(item.inclusions)
              ? item.inclusions
              : [];

            return (
              <article className="info-card" key={item.id}>
                <h2>{item.name}</h2>

                <hr
                  style={{
                    border: 0,
                    borderTop: "1px solid #ece3d7",
                    margin: "20px 0",
                  }}
                />

                <strong style={{ fontSize: 26 }}>
                  {item.price_per_person && item.price_per_person > 0
                    ? `\u20B1${Number(item.price_per_person).toLocaleString()} / person`
                    : "Price unavailable"}
                </strong>

                <p style={{ color: "#887E74", lineHeight: 1.7 }}>
                  {item.description || "Celebration catering package."}
                </p>

                {inclusions.length > 0 && (
                  <ul style={{ lineHeight: 2 }}>
                    {inclusions.map((value: unknown, index: number) => (
                      <li key={`${item.id}-${index}`}>
                        {"\u2713"} {String(value)}
                      </li>
                    ))}
                  </ul>
                )}

                <Link
                  href="/booking"
                  className="primary"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginTop: 24,
                  }}
                >
                  Book This Package
                </Link>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
