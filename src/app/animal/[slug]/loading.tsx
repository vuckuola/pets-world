export default function Loading() {
  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Hero skeleton */}
      <div className="bg-zinc-200 animate-pulse" style={{ height: 280 }}>
        <div className="max-w-3xl mx-auto px-4 py-16 sm:py-24 space-y-4">
          <div className="h-4 w-24 rounded bg-zinc-300 animate-pulse" />
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-zinc-300 animate-pulse" />
            <div className="w-10 h-10 rounded bg-zinc-300 animate-pulse" />
          </div>
          <div className="h-12 w-64 rounded bg-zinc-300 animate-pulse" />
          <div className="h-5 w-48 rounded bg-zinc-300 animate-pulse" />
          <div className="flex gap-2">
            <div className="h-7 w-32 rounded-full bg-zinc-300 animate-pulse" />
            <div className="h-7 w-20 rounded-full bg-zinc-300 animate-pulse" />
            <div className="h-7 w-28 rounded-full bg-zinc-300 animate-pulse" />
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        {/* Stats skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-zinc-200 px-4 py-3">
              <div className="h-3 w-16 rounded bg-zinc-100 animate-pulse" />
              <div className="h-4 w-24 mt-2 rounded bg-zinc-100 animate-pulse" />
            </div>
          ))}
        </div>

        {/* Description skeleton */}
        <div className="space-y-2">
          <div className="h-5 w-28 rounded bg-zinc-100 animate-pulse" />
          <div className="h-4 w-full rounded bg-zinc-100 animate-pulse" />
          <div className="h-4 w-5/6 rounded bg-zinc-100 animate-pulse" />
          <div className="h-4 w-3/4 rounded bg-zinc-100 animate-pulse" />
        </div>

        {/* Habitat skeleton */}
        <div className="space-y-2">
          <div className="h-5 w-20 rounded bg-zinc-100 animate-pulse" />
          <div className="flex gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-7 w-24 rounded-full bg-zinc-100 animate-pulse" />
            ))}
          </div>
        </div>

        {/* Fun facts skeleton */}
        <div className="space-y-2">
          <div className="h-5 w-24 rounded bg-zinc-100 animate-pulse" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-4 w-full rounded bg-zinc-100 animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  )
}
