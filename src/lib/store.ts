import { create } from 'zustand'
import { BloomingApiResponse } from '@/types/landsat'

// Chat message type for chat interface
interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

// Temporal analysis types
interface DateRange {
  start: Date
  end: Date
}

type Season = 'spring' | 'summer' | 'fall' | 'winter' | 'all'
type TrendMode = 'intensity' | 'species' | 'climate'
type ViewMode = 'monthly' | 'yearly' | 'seasonal'

// Insights and trend data types
interface TrendDataPoint {
  date: Date
  intensity: number
  speciesCount: number
  advanceDays: number
}

interface EcologicalInsight {
  id: string
  type: 'biodiversity' | 'conservation' | 'phenology' | 'health'
  title: string
  description: string
  confidence: number
  source: string
}

interface ConservationInsight {
  id: string
  type: 'threat' | 'opportunity' | 'recommendation'
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  actions: string[]
}

interface AppState {
  // Panel visibility state
  isPanelOpen: boolean
  isMinimized: boolean
  activeTab: string

  // Landsat Modal state
  isLandsatModalOpen: boolean
  landsatModalMinimized: boolean
  landsatModalPosition: { x: number; y: number }

  // Camera state
  cameraPosition: [number, number, number]

  // Selected location for Landsat data
  selectedLocation: { lat: number; lng: number } | null

  // Blooming data from API
  bloomingData: BloomingApiResponse['data'] | null

  // Scale management state
  scaleMode: 'global' | 'regional' | 'local'

  // Chat interface state
  isChatOpen: boolean
  isChatWidgetExtended: boolean
  chatMessages: ChatMessage[]
  chatWidgetSize: { width: number; height: number }
  chatWidgetPosition: { x: number; y: number }

  // Panel resize state
  panelSize: { width: number; height: number }
  panelPosition: { x: number; y: number }

  // Temporal analysis state
  selectedTimeRange: DateRange
  selectedSeason: Season | null
  trendMode: TrendMode
  viewMode: ViewMode

  // Insights and trend data state
  trendData: TrendDataPoint[]
  ecologicalInsights: EcologicalInsight[]
  conservationInsights: ConservationInsight[]

  // Actions
  togglePanel: () => void
  setPanelOpen: (open: boolean) => void
  setIsMinimized: (minimized: boolean) => void
  setActiveTab: (tab: string) => void
  
  // Landsat Modal actions
  setIsLandsatModalOpen: (open: boolean) => void
  setLandsatModalMinimized: (minimized: boolean) => void
  setLandsatModalPosition: (position: { x: number; y: number }) => void
  
  setCameraPosition: (position: [number, number, number]) => void
  setSelectedLocation: (location: { lat: number; lng: number } | null) => void
  setBloomingData: (data: BloomingApiResponse['data'] | null) => void
  setScaleMode: (mode: 'global' | 'regional' | 'local') => void
  setChatOpen: (open: boolean) => void
  setChatWidgetExtended: (extended: boolean) => void
  setChatWidgetSize: (size: { width: number; height: number }) => void
  setChatWidgetPosition: (position: { x: number; y: number }) => void
  setPanelSize: (size: { width: number; height: number }) => void
  setPanelPosition: (position: { x: number; y: number }) => void
  addChatMessage: (message: ChatMessage) => void
  setSelectedTimeRange: (range: DateRange) => void
  setSelectedSeason: (season: Season | null) => void
  setTrendMode: (mode: TrendMode) => void
  setViewMode: (mode: ViewMode) => void
  setTrendData: (data: TrendDataPoint[]) => void
  setEcologicalInsights: (insights: EcologicalInsight[]) => void
  setConservationInsights: (insights: ConservationInsight[]) => void
  restoreChatState: () => void
}

// Helper functions for localStorage persistence
const getStoredChatState = () => {
  if (typeof window === 'undefined') return null
  try {
    const stored = localStorage.getItem('bloome-chat-state')
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

const setStoredChatState = (state: { isChatOpen: boolean; isChatWidgetExtended: boolean; chatWidgetPosition: { x: number; y: number } }) => {
  if (typeof window === 'undefined') return
  try {
    // Only store position and open state, never store extended state
    const stateToStore = {
      isChatOpen: state.isChatOpen,
      isChatWidgetExtended: false, // Always store as false
      chatWidgetPosition: state.chatWidgetPosition
    }
    localStorage.setItem('bloome-chat-state', JSON.stringify(stateToStore))
  } catch {
    // Ignore localStorage errors
  }
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state - always start with default values to avoid hydration mismatch
  isPanelOpen: false,
  isMinimized: false,
  activeTab: 'overview',
  
  // Landsat Modal initial state
  isLandsatModalOpen: false,
  landsatModalMinimized: false,
  landsatModalPosition: { x: 16, y: 90 }, // Initial position matching current layout
  
  cameraPosition: [0, 0, 3.5],
  selectedLocation: null,
  bloomingData: null,
  scaleMode: 'global',
  isChatOpen: true, // Always start with chat open (button visible)
  isChatWidgetExtended: false, // But always start minimized
  chatMessages: [],
  chatWidgetSize: { width: 400, height: 350 },
  chatWidgetPosition: { x: 16, y: 0 },
  panelSize: { width: 500, height: 750 },
  panelPosition: { x: 0, y: 0 }, // Will be calculated to right position
  selectedTimeRange: { start: new Date('2023-01-01'), end: new Date('2024-12-31') },
  selectedSeason: 'all',
  trendMode: 'intensity',
  viewMode: 'monthly',
  trendData: [],
  ecologicalInsights: [],
  conservationInsights: [],

  // Actions
  togglePanel: () =>
    set((state) => ({ isPanelOpen: !state.isPanelOpen })),

  setPanelOpen: (open) =>
    set({ isPanelOpen: open }),

  setIsMinimized: (minimized) =>
    set({ isMinimized: minimized }),

  setActiveTab: (tab) =>
    set({ activeTab: tab }),

  // Landsat Modal actions
  setIsLandsatModalOpen: (open) =>
    set({ isLandsatModalOpen: open }),

  setLandsatModalMinimized: (minimized) =>
    set({ landsatModalMinimized: minimized }),

  setLandsatModalPosition: (position) =>
    set({ landsatModalPosition: position }),

  setCameraPosition: (position) =>
    set({ cameraPosition: position }),

  setSelectedLocation: (location) =>
    set({ selectedLocation: location }),

  setBloomingData: (data) =>
    set({ bloomingData: data }),

  setScaleMode: (mode) =>
    set({ scaleMode: mode }),

  setChatOpen: (open) =>
    set((state) => {
      const newState = { ...state, isChatOpen: open }
      // Only persist if chat is being closed (to remember position)
      if (!open) {
        setStoredChatState({
          isChatOpen: newState.isChatOpen,
          isChatWidgetExtended: false, // Always store as false
          chatWidgetPosition: newState.chatWidgetPosition
        })
      }
      return newState
    }),

  setChatWidgetExtended: (extended) =>
    set((state) => {
      const newState = { ...state, isChatWidgetExtended: extended }
      // Only persist position, never extended state
      setStoredChatState({
        isChatOpen: newState.isChatOpen,
        isChatWidgetExtended: false, // Always store as false
        chatWidgetPosition: newState.chatWidgetPosition
      })
      return newState
    }),

  setChatWidgetSize: (size) =>
    set({ chatWidgetSize: size }),

  setChatWidgetPosition: (position) =>
    set((state) => {
      const newState = { ...state, chatWidgetPosition: position }
      // Persist position only
      setStoredChatState({
        isChatOpen: newState.isChatOpen,
        isChatWidgetExtended: false, // Always store as false
        chatWidgetPosition: newState.chatWidgetPosition
      })
      return newState
    }),

  setPanelSize: (size) =>
    set({ panelSize: size }),

  setPanelPosition: (position) =>
    set({ panelPosition: position }),

  addChatMessage: (message) =>
    set((state) => ({ chatMessages: [...state.chatMessages, message] })),

  setSelectedTimeRange: (range) =>
    set({ selectedTimeRange: range }),

  setSelectedSeason: (season) =>
    set({ selectedSeason: season }),

  setTrendMode: (mode) =>
    set({ trendMode: mode }),

  setViewMode: (mode) =>
    set({ viewMode: mode }),

  setTrendData: (data) =>
    set({ trendData: data }),

  setEcologicalInsights: (insights) =>
    set({ ecologicalInsights: insights }),

  setConservationInsights: (insights) =>
    set({ conservationInsights: insights }),

  restoreChatState: () => {
    const storedState = getStoredChatState()
    if (storedState) {
      set({
        // Always start minimized, but keep chat "open" so button is visible
        isChatOpen: true,
        isChatWidgetExtended: false, // Always start minimized - override any stored extended state
        chatWidgetPosition: storedState.chatWidgetPosition || { x: 16, y: 0 }
      })
    } else {
      // First time - initialize with button visible
      set({
        isChatOpen: true,
        isChatWidgetExtended: false
      })
    }
  },
}))
