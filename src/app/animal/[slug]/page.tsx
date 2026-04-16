import { Metadata } from 'next'
import Link from 'next/link'
import rawData from '@/data/animals.json'
import { IUCN_CONFIG } from '@/lib/iucn'

const STATUS_CODE: Record<string, string> = {
  'Critically Endangered': 'CR', 'Endangered': 'EN', 'Vulnerable': 'VU',
  'Near Threatened': 'NT', 'Least Concern': 'LC', 'Data Deficient': 'DD',
}

type AnimalData = typeof rawData[number]

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return rawData.map(a => ({ slug: a.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const animal = rawData.find(a => a.slug === slug)
  if (!animal) return { title: 'Animal Not Found' }
  const desc = animal.description?.slice(0, 160) || `Learn about the ${animal.commonName} (${animal.scientificName})`
  return {
    title: `${animal.commonName} — World Wildlife Atlas`,
    description: desc,
    openGraph: {
      title: `${animal.commonName} — World Wildlife Atlas`,
      description: desc,
      type: 'article',
    },
  }
}

export default async function AnimalDetailPage({ params }: Props) {
  const { slug } = await params
  const animal = rawData.find(a => a.slug === slug) as AnimalData | undefined

  if (!animal) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-zinc-800">Animal Not Found</h1>
          <Link href="/" className="mt-4 inline-block text-blue-600 hover:underline">← Back to Map</Link>
        </div>
      </div>
    )
  }

  const iucnCode = animal.iucnStatus || 'LC'
  const iucn = IUCN_CONFIG[iucnCode] || IUCN_CONFIG.LC
  const statusCode = STATUS_CODE[animal.conservationStatus] || animal.iucnStatus || 'LC'

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Hero */}
      <div className="relative bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 text-white">
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="relative max-w-3xl mx-auto px-4 py-16 sm:py-24">
          <Link href="/" className="inline-flex items-center gap-1 text-sm text-zinc-300 hover:text-white mb-6 transition-colors">
            ← Back to Map
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-5xl">{animal.emoji}</span>
            <span className="text-3xl">{animal.flag}</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold">{animal.commonName}</h1>
          <p className="text-lg text-zinc-300 italic mt-1">{animal.scientificName}</p>
          <div className="mt-4 flex items-center gap-3 flex-wrap">
            <span
              className="px-3 py-1 rounded-full text-sm font-semibold"
              style={{ background: iucn.bg, color: '#fff' }}
            >
              {iucn.label}
            </span>
            <span className="px-3 py-1 rounded-full text-sm bg-white/10 text-zinc-200">
              {animal.region}
            </span>
            <span className="px-3 py-1 rounded-full text-sm bg-white/10 text-zinc-200">
              {animal.classification}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Classification" value={animal.classification} />
          <StatCard label="Diet" value={animal.diet} />
          <StatCard label="Lifespan" value={`${animal.lifespan.min}–${animal.lifespan.max} ${animal.lifespan.unit}`} />
          <StatCard label="Weight" value={`${animal.weight.min}–${animal.weight.max} ${animal.weight.unit}`} />
        </div>

        {/* Description */}
        <section>
          <h2 className="text-lg font-semibold text-zinc-800 mb-2">Description</h2>
          <p className="text-zinc-600 leading-relaxed">{animal.description}</p>
        </section>

        {/* Habitat */}
        <section>
          <h2 className="text-lg font-semibold text-zinc-800 mb-2">Habitat</h2>
          <div className="flex flex-wrap gap-2">
            {animal.habitat.map((h, i) => (
              <span key={i} className="px-3 py-1 rounded-full text-sm bg-green-50 text-green-700 border border-green-100">
                {h}
              </span>
            ))}
          </div>
        </section>

        {/* Taxonomy */}
        <section>
          <h2 className="text-lg font-semibold text-zinc-800 mb-2">Taxonomy</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {Object.entries(animal.taxonomy).map(([key, val]) => (
              <div key={key} className="bg-white rounded-lg border border-zinc-200 px-3 py-2">
                <div className="text-xs text-zinc-400 capitalize">{key}</div>
                <div className="text-sm font-medium text-zinc-700 italic">{val}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Fun Facts */}
        <section>
          <h2 className="text-lg font-semibold text-zinc-800 mb-2">Fun Facts</h2>
          <ul className="space-y-2">
            {animal.funFacts.map((fact, i) => (
              <li key={i} className="flex gap-2 text-sm text-zinc-600 leading-relaxed">
                <span className="shrink-0 mt-0.5 w-1.5 h-1.5 rounded-full" style={{ background: iucn.bg }} />
                <span>{fact}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Population & Links */}
        <section className="flex items-center gap-3 flex-wrap">
          <span className="px-3 py-1 rounded-full text-sm bg-purple-50 text-purple-700 border border-purple-100">
            Pop: {animal.population}
          </span>
          {animal.wikiUrl && (
            <a
              href={animal.wikiUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline"
            >
              Wikipedia →
            </a>
          )}
        </section>
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-lg border border-zinc-200 px-4 py-3">
      <div className="text-xs text-zinc-400">{label}</div>
      <div className="text-sm font-semibold text-zinc-800 mt-0.5">{value}</div>
    </div>
  )
}
