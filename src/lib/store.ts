import { create } from 'zustand'

interface AppState {
  // Panel visibility state
  isPanelOpen: boolean
  
  // Camera state
  cameraPosition: [number, number, number]
  
  // Actions
  togglePanel: () => void
  setPanelOpen: (open: boolean) => void
  setCameraPosition: (position: [number, number, number]) => void
}

export const useAppStore = create<AppState>((set) => ({
  // Initial state
  isPanelOpen: false,
  cameraPosition: [0, 0, 3.5],
  
  // Actions
  togglePanel: () => 
    set((state) => ({ isPanelOpen: !state.isPanelOpen })),
  
  setPanelOpen: (open) => 
    set({ isPanelOpen: open }),
  
  setCameraPosition: (position) => 
    set({ cameraPosition: position }),
}))
