'use client'

import { useMemo } from 'react'
import { countries } from '../data/countries'
import type { AnimalEntry } from '../data/countries'
import { useMapStore } from '../store/useMapStore'

/** Returns filtered and searched animal list from the map store */
export function useFilteredAnimals(): AnimalEntry[] {
  const { searchQuery, activeRegion } = useMapStore()

  return useMemo(() => {
    const s = searchQuery.toLowerCase()
    return countries.filter((c) => {
      const matchContinent = activeRegion === 'All' || c.region === activeRegion
      const matchSearch = !s || c.country.toLowerCase().includes(s) || c.animal.toLowerCase().includes(s)
      return matchContinent && matchSearch
    })
  }, [searchQuery, activeRegion])
}
