'use client'
import { useMapStore } from '../store/useMapStore'
import { t } from '../lib/i18n'

export default function Loading() {
  const { locale } = useMapStore()
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-zinc-400">{t(locale).loading}</div>
    </div>
  )
}
