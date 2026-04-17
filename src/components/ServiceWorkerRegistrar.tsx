'use client'

import { useEffect } from 'react'

/** Registers the service worker for PWA support */
export default function ServiceWorkerRegistrar(): React.ReactElement | null {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
    }
  }, [])
  return null
}
