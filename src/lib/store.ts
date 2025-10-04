import { create } from 'zustand'
import { Hotspot } from './data'

interface AppState {
  // Selected location state
  selectedLocation: Hotspot | null
  
  // Panel visibility state
  isPanelOpen: boolean
  
  // Hover state
  hoveredHotspot: Hotspot | null
  
  // Camera state
  cameraPosition: [number, number, number]
  
  // Actions
  setSelectedLocation: (location: Hotspot | null) => void
  togglePanel: () => void
  setPanelOpen: (open: boolean) => void
  setHoveredHotspot: (hotspot: Hotspot | null) => void
  setCameraPosition: (position: [number, number, number]) => void
}

export const useAppStore = create<AppState>((set) => ({
  // Initial state
  selectedLocation: null,
  isPanelOpen: false,
  hoveredHotspot: null,
  cameraPosition: [0, 0, 3.5],
  
  // Actions
  setSelectedLocation: (location) => 
    set({ selectedLocation: location }),
  
  togglePanel: () => 
    set((state) => ({ isPanelOpen: !state.isPanelOpen })),
  
  setPanelOpen: (open) => 
    set({ isPanelOpen: open }),
  
  setHoveredHotspot: (hotspot) => 
    set({ hoveredHotspot: hotspot }),
  
  setCameraPosition: (position) => 
    set({ cameraPosition: position }),
}))
