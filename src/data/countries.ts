import { animalSchema } from '../lib/schemas'
import rawData from './animals.json'

export const countries = rawData.map(a => animalSchema.parse(a))
export type AnimalEntry = z.infer<typeof animalSchema>

import { z } from 'zod'

export const continents = Array.from(new Set(countries.map(c => c.region))).sort()
