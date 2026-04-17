import { create } from 'zustand'
import type { Locale } from '../lib/i18n'

/** Supported map tile style names */
type MapStyleName = 'voyager' | 'dark' | 'satellite'

/** Global map state shape */
interface MapStore {
  selectedId: string | null
  hoveredId: string | null
  sidebarHoveredId: string | null
  searchQuery: string
  activeRegion: string
  mapStyle: MapStyleName
  searchOpen: boolean
  mobileOpen: boolean
  locale: Locale
  setSearchOpen: (open: boolean) => void
  setSelectedId: (id: string | null) => void
  setHoveredId: (id: string | null) => void
  setSidebarHoveredId: (id: string | null) => void
  setSearchQuery: (q: string) => void
  setActiveRegion: (r: string) => void
  setMapStyle: (s: MapStyleName) => void
  setMobileOpen: (open: boolean) => void
  toggleMobileOpen: () => void
  setLocale: (l: Locale) => void
}

export type { MapStyleName }

/** Global map state store backed by Zustand */
export const useMapStore = create<MapStore>((set) => ({
  selectedId: null,
  hoveredId: null,
  sidebarHoveredId: null,
  searchQuery: '',
  activeRegion: 'All',
  mapStyle: 'voyager',
  searchOpen: false,
  mobileOpen: false,
  locale: 'en' as Locale,
  setSelectedId: (id) => set({ selectedId: id }),
  setHoveredId: (id) => set({ hoveredId: id }),
  setSidebarHoveredId: (id) => set({ sidebarHoveredId: id }),
  setSearchQuery: (q) => set({ searchQuery: q }),
  setActiveRegion: (r) => set({ activeRegion: r }),
  setMapStyle: (s) => set({ mapStyle: s }),
  setSearchOpen: (open) => set({ searchOpen: open }),
  setMobileOpen: (open) => set({ mobileOpen: open }),
  toggleMobileOpen: () => set((s) => ({ mobileOpen: !s.mobileOpen })),
  setLocale: (l) => set({ locale: l }),
}))
