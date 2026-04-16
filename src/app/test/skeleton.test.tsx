import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'

describe('AnimalListSkeleton', () => {
  it('renders skeleton rows', async () => {
    const { default: AnimalListSkeleton } = await import('../../components/AnimalListSkeleton')
    const { container } = render(<AnimalListSkeleton />)
    // Should have 10 skeleton rows
    const rows = container.querySelectorAll('.animate-pulse')
    expect(rows.length).toBeGreaterThanOrEqual(10)
  })
})
