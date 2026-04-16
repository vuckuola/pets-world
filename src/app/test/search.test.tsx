import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'

describe('AnimalSearch', () => {
  it('renders search component without crashing', async () => {
    const { default: AnimalSearch } = await import('../../components/AnimalSearch')
    render(<AnimalSearch />)
  })
})
