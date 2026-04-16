'use client'
import { useMapStore } from './store/useMapStore'
import { t } from './lib/i18n'

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  const { locale } = useMapStore()
  const tr = t(locale)
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center p-8">
        <h2 className="text-xl font-semibold mb-2">{tr.error}</h2>
        <p className="text-zinc-500 mb-4">{error.message}</p>
        <button onClick={reset} className="px-4 py-2 bg-zinc-900 text-white rounded-lg">{tr.tryAgain}</button>
      </div>
    </div>
  )
}
