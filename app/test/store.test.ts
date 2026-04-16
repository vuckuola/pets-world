import { describe, it, expect, beforeEach } from 'vitest'
import { useMapStore } from '../store/useMapStore'

describe('useMapStore', () => {
  beforeEach(() => {
    useMapStore.setState({
      selectedId: null,
      hoveredId: null,
      sidebarHoveredId: null,
      searchQuery: '',
      activeRegion: 'All',
      mapStyle: 'voyager',
      mobileOpen: false,
    })
  })

  it('selects a country', () => {
    useMapStore.getState().setSelectedId('id')
    expect(useMapStore.getState().selectedId).toBe('id')
  })

  it('clears selection', () => {
    useMapStore.getState().setSelectedId('id')
    useMapStore.getState().setSelectedId(null)
    expect(useMapStore.getState().selectedId).toBeNull()
  })

  it('sets hover', () => {
    useMapStore.getState().setHoveredId('cn')
    expect(useMapStore.getState().hoveredId).toBe('cn')
  })

  it('sets search query', () => {
    useMapStore.getState().setSearchQuery('panda')
    expect(useMapStore.getState().searchQuery).toBe('panda')
  })

  it('sets active region', () => {
    useMapStore.getState().setActiveRegion('Asia')
    expect(useMapStore.getState().activeRegion).toBe('Asia')
  })

  it('toggles mobile open', () => {
    expect(useMapStore.getState().mobileOpen).toBe(false)
    useMapStore.getState().toggleMobileOpen()
    expect(useMapStore.getState().mobileOpen).toBe(true)
    useMapStore.getState().toggleMobileOpen()
    expect(useMapStore.getState().mobileOpen).toBe(false)
  })

  it('cycles map style', () => {
    useMapStore.getState().setMapStyle('dark')
    expect(useMapStore.getState().mapStyle).toBe('dark')
    useMapStore.getState().setMapStyle('satellite')
    expect(useMapStore.getState().mapStyle).toBe('satellite')
  })
})
