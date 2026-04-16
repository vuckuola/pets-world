import { z } from 'zod'

export const IUCNStatus = z.enum(['EX','EW','CR','EN','VU','NT','LC','DD','NE'])

export const AnimalSchema = z.object({
  id: z.string(),
  slug: z.string().min(1),
  commonName: z.string(),
  scientificName: z.string(),
  taxonomy: z.object({
    kingdom: z.string(),
    phylum: z.string(),
    class: z.string(),
    order: z.string(),
    family: z.string(),
    genus: z.string(),
  }),
  iucnStatus: IUCNStatus,
  description: z.string(),
  habitat: z.array(z.string()),
  diet: z.enum(['Carnivore','Herbivore','Omnivore','Insectivore','Piscivore']),
  lifespan: z.object({ min: z.number(), max: z.number(), unit: z.literal('years') }),
  weight: z.object({ min: z.number(), max: z.number(), unit: z.enum(['kg','g']) }),
  nativeRegions: z.array(z.string()),
  coordinates: z.array(z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
    label: z.string().optional()
  })),
  images: z.array(z.object({
    url: z.string().url(),
    credit: z.string(),
    alt: z.string()
  })),
  funFacts: z.array(z.string()),
  wikiUrl: z.string().url().optional(),
  iucnUrl: z.string().url().optional(),
  updatedAt: z.string().datetime(),
})

export type Animal = z.infer<typeof AnimalSchema>
