import { z } from 'zod'
import rawData from './animals.json'

// Legacy schema for backward compat with existing components
export const animalSchema = z.object({
  id: z.string(),
  country: z.string(),
  flag: z.string(),
  lat: z.number(),
  lng: z.number(),
  region: z.string(),
  animal: z.string(),
  scientificName: z.string(),
  emoji: z.string(),
  classification: z.string(),
  conservationStatus: z.enum(['Least Concern', 'Near Threatened', 'Vulnerable', 'Endangered', 'Critically Endangered', 'Data Deficient']),
  indigenous: z.boolean(),
  funFacts: z.array(z.string()),
  habitat: z.string(),
  population: z.string(),
})

export const countries = rawData.map(a => {
  // Extract lat/lng from coordinates for backward compat
  const parsed = { ...a, lat: a.coordinates[0]?.lat ?? 0, lng: a.coordinates[0]?.lng ?? 0, animal: a.commonName, habitat: a.habitatOld || a.habitat?.join(', ') || '' }
  return animalSchema.parse(parsed)
})
export type AnimalEntry = z.infer<typeof animalSchema>

// New full animal type (with taxonomy, diet, etc.)
export { type Animal } from '../types/animal'

export const continents = Array.from(new Set(countries.map(c => c.region))).sort()
