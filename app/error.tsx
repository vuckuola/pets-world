'use client'
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center p-8">
        <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
        <p className="text-zinc-500 mb-4">{error.message}</p>
        <button onClick={reset} className="px-4 py-2 bg-zinc-900 text-white rounded-lg">Try again</button>
      </div>
    </div>
  )
}
