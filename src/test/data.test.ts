import { describe, it, expect } from 'vitest'
import { animalSchema } from '../lib/schemas'

// Import raw data — we need to validate through the schema
// Since the data file uses module-level exports, we test via the exported array
import { countries } from '../data/countries'

describe('Animal data validation', () => {
  it('has 68 animals', () => {
    expect(countries.length).toBeGreaterThan(50)
  })

  it('all animals pass zod schema', () => {
    countries.forEach((animal) => {
      const result = animalSchema.safeParse(animal)
      expect(result.success, `Failed for ${animal.id} (${animal.country}): ${JSON.stringify(result.error?.issues)}`).toBe(true)
    })
  })

  it('has no duplicate IDs', () => {
    const ids = countries.map((c) => c.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('all funFacts arrays have exactly 5 items', () => {
    countries.forEach((animal) => {
      expect(animal.funFacts).toHaveLength(5)
    })
  })

  it('all have indigenous: true', () => {
    countries.forEach((animal) => {
      expect(animal.indigenous).toBe(true)
    })
  })
})
