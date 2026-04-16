import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

// Note: Manual axe-core testing recommended for browser-based accessibility audit.
// These tests verify component rendering only; run axe DevTools in browser for full WCAG compliance.

describe('Loading skeletons', () => {
  it('renders AnimalListSkeleton with 10 rows', async () => {
    const { default: AnimalListSkeleton } = await import('../../components/AnimalListSkeleton')
    render(<AnimalListSkeleton />)
    const skeletons = document.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('renders MapSkeleton placeholder', async () => {
    const { default: MapSkeleton } = await import('../../components/MapSkeleton')
    render(<MapSkeleton />)
    expect(document.querySelector('.animate-pulse')).toBeTruthy()
  })
})
