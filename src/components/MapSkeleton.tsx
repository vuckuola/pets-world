'use client'

/** Animated placeholder for the map area */
export default function MapSkeleton(): React.JSX.Element {
  return (
    <div className="absolute inset-0 bg-zinc-100 animate-pulse" aria-hidden="true" />
  )
}
