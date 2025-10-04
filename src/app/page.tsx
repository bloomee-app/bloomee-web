'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Globe from '@/components/globe/Globe'
import ComparisonPanel from '@/components/panel/ComparisonPanel'
import { useAppStore } from '@/lib/store'
import { AboutDialog } from '@/components/modal/AboutModal'

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
    <div className="min-h-screen bg-black">
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
                   <p className="text-blue-200">See Earth in Bloom</p>
                 </div>
        </div>
      </header>

            {/* Main Content */}
            <main className="relative h-screen">
              {/* 3D Earth Canvas */}
              <Globe className="w-full h-full" />



        {/* Comparison Panel */}
        <ComparisonPanel />
      </main>

      {/* Footer */}
      <footer className="absolute bottom-0 right-6 z-10 p-4">
        <div className="text-white/60 text-sm">
          <p>Powered by NASA Landsat & Three.js</p>
        </div>
      </footer>
    </div>
  )
}
