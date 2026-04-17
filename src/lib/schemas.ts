import { z } from 'zod'

/** Schema for legacy animal entry used by map components */
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

/** Legacy animal entry type */
export type Animal = z.infer<typeof animalSchema>
