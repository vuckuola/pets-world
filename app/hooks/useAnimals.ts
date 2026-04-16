'use client'
import { useMemo } from 'react'
import { countries } from '../data/countries'
import { useMapStore } from '../store/useMapStore'

export function useFilteredAnimals() {
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
