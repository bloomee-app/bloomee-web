import { create } from 'zustand'

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

type Season = 'spring' | 'summer' | 'fall' | 'winter'
type TrendMode = 'intensity' | 'species' | 'advance'

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

  // Camera state
  cameraPosition: [number, number, number]

  // Selected location for Landsat data
  selectedLocation: { lat: number; lng: number } | null

  // Scale management state
  scaleMode: 'global' | 'regional' | 'local'

  // Chat interface state
  isChatOpen: boolean
  chatMessages: ChatMessage[]

  // Temporal analysis state
  selectedTimeRange: DateRange
  selectedSeason: Season | null
  trendMode: TrendMode

  // Insights and trend data state
  trendData: TrendDataPoint[]
  ecologicalInsights: EcologicalInsight[]
  conservationInsights: ConservationInsight[]

  // Actions
  togglePanel: () => void
  setPanelOpen: (open: boolean) => void
  setIsMinimized: (minimized: boolean) => void
  setActiveTab: (tab: string) => void
  setCameraPosition: (position: [number, number, number]) => void
  setSelectedLocation: (location: { lat: number; lng: number } | null) => void
  setScaleMode: (mode: 'global' | 'regional' | 'local') => void
  setChatOpen: (open: boolean) => void
  addChatMessage: (message: ChatMessage) => void
  setSelectedTimeRange: (range: DateRange) => void
  setSelectedSeason: (season: Season | null) => void
  setTrendMode: (mode: TrendMode) => void
  setTrendData: (data: TrendDataPoint[]) => void
  setEcologicalInsights: (insights: EcologicalInsight[]) => void
  setConservationInsights: (insights: ConservationInsight[]) => void
}

export const useAppStore = create<AppState>((set) => ({
  // Initial state
  isPanelOpen: false,
  isMinimized: false,
  activeTab: 'overview',
  cameraPosition: [0, 0, 3.5],
  selectedLocation: null,
  scaleMode: 'global',
  isChatOpen: false,
  chatMessages: [],
  selectedTimeRange: { start: new Date('2023-01-01'), end: new Date('2024-12-31') },
  selectedSeason: null,
  trendMode: 'intensity',
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

  setCameraPosition: (position) =>
    set({ cameraPosition: position }),

  setSelectedLocation: (location) =>
    set({ selectedLocation: location }),

  setScaleMode: (mode) =>
    set({ scaleMode: mode }),

  setChatOpen: (open) =>
    set({ isChatOpen: open }),

  addChatMessage: (message) =>
    set((state) => ({ chatMessages: [...state.chatMessages, message] })),

  setSelectedTimeRange: (range) =>
    set({ selectedTimeRange: range }),

  setSelectedSeason: (season) =>
    set({ selectedSeason: season }),

  setTrendMode: (mode) =>
    set({ trendMode: mode }),

  setTrendData: (data) =>
    set({ trendData: data }),

  setEcologicalInsights: (insights) =>
    set({ ecologicalInsights: insights }),

  setConservationInsights: (insights) =>
    set({ conservationInsights: insights }),
}))
