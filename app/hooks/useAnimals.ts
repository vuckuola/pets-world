'use client'
import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { countries } from '../data/countries'
import { useMapStore } from '../store/useMapStore'

export function useFilteredAnimals() {
  const { searchQuery, activeRegion } = useMapStore()

  const allAnimals = useMemo(() => countries, [])

  const { data: filtered } = useQuery({
    queryKey: ['animals', searchQuery, activeRegion],
    queryFn: () => {
      const s = searchQuery.toLowerCase()
      return allAnimals.filter((c) => {
        const matchContinent = activeRegion === 'All' || c.region === activeRegion
        const matchSearch = !s || c.country.toLowerCase().includes(s) || c.animal.toLowerCase().includes(s)
        return matchContinent && matchSearch
      })
    },
    staleTime: 0,
  })

  return filtered ?? allAnimals
}
