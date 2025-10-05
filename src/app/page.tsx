'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Globe from '@/components/globe/Globe'
import ComparisonPanel from '@/components/panel/ComparisonPanel'
import ChatWidget from '@/components/chat/ChatWidget'
import { useAppStore } from '@/lib/store'
import { AboutDialog } from '@/components/modal/AboutModal'
import TimeSlider from '@/components/panel/Timeslider'

// Temporary loading component
function Loading() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
    </div>
  )
}

export default function HomePage() {
  const { isPanelOpen, togglePanel } = useAppStore()

  return (
    <>
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-10 p-6">
        <div className="flex items-center justify-between">
                 <div className="text-white">
                   <div className="flex items-center gap-3">
                     <img 
                       src="/logo/logo-text.png" 
                       alt="Bloome" 
                       className="h-10 w-auto -ml-1.5"
                     />
                   </div>
                   <p className="text-blue-200">Our Planet in Bloom</p>
                 </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative h-screen min-h-screen bg-black">
        {/* 3D Earth Canvas */}
        <Globe className="w-full h-full" />

        {/* Comparison Panel */}
        <ComparisonPanel />

        {/* Chat Widget */}
        <ChatWidget />
      </main>

      {/* Time Slider */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
        <TimeSlider />
      </div>

      {/* Footer */}
      <footer className="absolute bottom-0 right-6 z-10 p-4">
        <div className="text-white/60 text-sm">
          <p>Powered by NASA Landsat</p>
        </div>
      </footer>
    </>
  )
}
