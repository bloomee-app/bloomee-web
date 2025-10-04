'use client'

import { useAppStore } from '@/lib/store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function ComparisonPanel() {
  const { isPanelOpen, selectedLocation, setPanelOpen } = useAppStore()

  if (!isPanelOpen || !selectedLocation) return null

  return (
    <div className="absolute top-6 right-6 z-10">
      <Card className="w-80 bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="text-white">Comparison View</CardTitle>
          <CardDescription className="text-blue-200">
            {selectedLocation.name}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-white/80 text-sm">
            <p>Compare satellite imagery over time to see environmental changes.</p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              View Timeline
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="border-white/20 text-white hover:bg-white/20"
              onClick={() => setPanelOpen(false)}
            >
              Close
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
