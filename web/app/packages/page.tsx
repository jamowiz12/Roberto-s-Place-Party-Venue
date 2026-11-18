import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

type PackageRow = {
  id: number
  name: string
  description: string | null
  price_per_person: number | null
  inclusions: unknown
}

export default async function Packages() {
  let data: PackageRow[] | null = null
  let error: unknown = null
  try {
    const supabase = await createClient()
    const result = await supabase
      .from('packages')
      .select('id, name, description, price_per_person, inclusions')
      .eq('active', true)
      .order('price_per_person', { ascending: true })
    data = result.data
    error = result.error
  } catch {
    error = new Error('Supabase is not configured.')
  }

  const packages = error ? [] : (data || [])

  return (
    <section className="content-section">
      <p className="eyebrow">CELEBRATION PACKAGES</p>
      <h1 className="page-title">Choose the perfect table</h1>
      <p style={{ color: '#887E74', maxWidth: 560 }}>Thoughtfully prepared options for intimate gatherings and grand celebrations.</p>
      {packages.length === 0 ? (
        <div className="info-card" style={{ marginTop: 24 }}><p style={{ color: '#887E74' }}>No active packages are available right now.</p></div>
      ) : (
        <div className="cards-grid">
          {packages.map((item) => {
            const inclusions = Array.isArray(item.inclusions) ? item.inclusions : []
            return (
              <article className="info-card" key={item.id}>
                <h2>{item.name}</h2>
                <hr style={{ border: 0, borderTop: '1px solid #ece3d7', margin: '20px 0' }} />
                <strong style={{ fontSize: 26 }}>{item.price_per_person && item.price_per_person > 0 ? `₱${Number(item.price_per_person).toLocaleString()} / person` : 'Price unavailable'}</strong>
                <p style={{ color: '#887E74', lineHeight: 1.7 }}>{item.description || 'Celebration catering package.'}</p>
                {inclusions.length > 0 ? <ul>{inclusions.map((value: unknown) => <li key={String(value)}>✓ {String(value)}</li>)}</ul> : null}
                <Link href="/booking" className="primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 24 }}>Book this package</Link>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}
