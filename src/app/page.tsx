'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Globe from '@/components/globe/Globe'
import HotspotTooltip from '@/components/globe/HotspotTooltip'
import ComparisonPanel from '@/components/panel/ComparisonPanel'
import { useAppStore } from '@/lib/store'
import { Hotspot } from '@/lib/data'

// Temporary loading component
function Loading() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
    </div>
  )
}

export default function HomePage() {
  const { selectedLocation, isPanelOpen, setSelectedLocation, togglePanel } = useAppStore()
  
  const handleHotspotClick = (hotspot: Hotspot) => {
    console.log('🎯 Hotspot clicked:', hotspot.name)
    console.log('📍 Setting selected location:', hotspot)
    setSelectedLocation(hotspot)
    if (!isPanelOpen) {
      console.log('📋 Opening panel for:', hotspot.name)
      togglePanel()
    }
    console.log('✅ Store state updated successfully')
  }

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
                       className="h-10 w-auto"
                     />
                   </div>
                   <p className="text-blue-200">Earth Bloom Dashboard</p>
                 </div>
          <div className="flex gap-4">
            <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
              About
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700">
              Explore Earth
            </Button>
          </div>
        </div>
      </header>

            {/* Main Content */}
            <main className="relative h-screen">
              {/* 3D Earth Canvas */}
              <Globe className="w-full h-full" onHotspotClick={handleHotspotClick} />
              
              {/* Hotspot Tooltip */}
              <HotspotTooltip />

        {/* Welcome Card */}
        {!isPanelOpen && (
          <div className="absolute bottom-6 left-6 z-10">
            <Card className="w-80 bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Welcome to Bloome</CardTitle>
                <CardDescription className="text-blue-200">
                  Interactive 3D Earth Observation Platform
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-white/80 text-sm">
                  Explore environmental changes through satellite imagery and interactive 3D visualization.
                </p>
                <div className="flex gap-2">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    Start Exploring
                  </Button>
                  <Button size="sm" variant="outline" className="border-white/20 text-white hover:bg-white/20">
                    Learn More
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Hotspot Info Panel */}
        {isPanelOpen && selectedLocation && (
          <div className="absolute bottom-6 left-6 z-10">
            <Card className="w-80 bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-white">{selectedLocation.name}</CardTitle>
                <CardDescription className="text-blue-200">
                  {selectedLocation.type.charAt(0).toUpperCase() + selectedLocation.type.slice(1)} • {selectedLocation.severity} severity
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-white/80 text-sm">{selectedLocation.description}</p>
                <div className="flex gap-2">
                  <Button 
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => console.log('Open comparison panel for:', selectedLocation.name)}
                  >
                    View Comparison
                  </Button>
                  <Button 
                    size="sm"
                    variant="outline" 
                    className="border-white/20 text-white hover:bg-white/20"
                    onClick={() => togglePanel()}
                  >
                    Close
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

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
