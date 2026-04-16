import { z } from 'zod'

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
  indigenous: z.literal(true),
  funFacts: z.array(z.string()).length(5),
  habitat: z.string(),
  population: z.string(),
})

export type Animal = z.infer<typeof animalSchema>
