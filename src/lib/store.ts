import { create } from 'zustand'

interface AppState {
  // Panel visibility state
  isPanelOpen: boolean

  // Camera state
  cameraPosition: [number, number, number]

  // Selected location for Landsat data
  selectedLocation: { lat: number; lng: number } | null

  // Actions
  togglePanel: () => void
  setPanelOpen: (open: boolean) => void
  setCameraPosition: (position: [number, number, number]) => void
  setSelectedLocation: (location: { lat: number; lng: number } | null) => void
}

export const useAppStore = create<AppState>((set) => ({
  // Initial state
  isPanelOpen: false,
  cameraPosition: [0, 0, 3.5],
  selectedLocation: null,

  // Actions
  togglePanel: () =>
    set((state) => ({ isPanelOpen: !state.isPanelOpen })),

  setPanelOpen: (open) =>
    set({ isPanelOpen: open }),

  setCameraPosition: (position) =>
    set({ cameraPosition: position }),

  setSelectedLocation: (location) =>
    set({ selectedLocation: location }),
}))
