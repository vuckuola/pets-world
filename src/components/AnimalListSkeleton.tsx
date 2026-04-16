'use client'

export default function AnimalListSkeleton() {
  return (
    <div className="flex flex-col gap-2 p-1">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="flex items-center gap-2 rounded-lg px-3 py-3">
          <div className="w-2 h-2 rounded-full bg-zinc-100 animate-pulse shrink-0" />
          <div className="w-6 h-6 rounded bg-zinc-100 animate-pulse shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3.5 w-3/4 rounded bg-zinc-100 animate-pulse" />
            <div className="h-3 w-1/2 rounded bg-zinc-100 animate-pulse" />
          </div>
          <div className="h-4 w-12 rounded-full bg-zinc-100 animate-pulse" />
        </div>
      ))}
    </div>
  )
}
