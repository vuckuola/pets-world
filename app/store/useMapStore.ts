import { create } from 'zustand'

interface MapStore {
  selectedId: string | null
  hoveredId: string | null
  sidebarHoveredId: string | null
  searchQuery: string
  activeRegion: string
  mapStyle: 'dark' | 'voyager' | 'satellite'
  mobileOpen: boolean
  setSelectedId: (id: string | null) => void
  setHoveredId: (id: string | null) => void
  setSidebarHoveredId: (id: string | null) => void
  setSearchQuery: (q: string) => void
  setActiveRegion: (r: string) => void
  setMapStyle: (s: 'dark' | 'voyager' | 'satellite') => void
  setMobileOpen: (open: boolean) => void
  toggleMobileOpen: () => void
}

export const useMapStore = create<MapStore>((set) => ({
  selectedId: null,
  hoveredId: null,
  sidebarHoveredId: null,
  searchQuery: '',
  activeRegion: 'All',
  mapStyle: 'voyager',
  mobileOpen: false,
  setSelectedId: (id) => set({ selectedId: id }),
  setHoveredId: (id) => set({ hoveredId: id }),
  setSidebarHoveredId: (id) => set({ sidebarHoveredId: id }),
  setSearchQuery: (q) => set({ searchQuery: q }),
  setActiveRegion: (r) => set({ activeRegion: r }),
  setMapStyle: (s) => set({ mapStyle: s }),
  setMobileOpen: (open) => set({ mobileOpen: open }),
  toggleMobileOpen: () => set((s) => ({ mobileOpen: !s.mobileOpen })),
}))
