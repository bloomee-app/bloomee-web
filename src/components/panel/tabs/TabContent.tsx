'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BloomingApiResponse } from '@/types/landsat'
import OverviewTab from './OverviewTab'
import TrendsTab from './TrendsTab'
import InsightsTab from './InsightsTab'
import DecisionsTab from './DecisionsTab'

interface TabContentProps {
  bloomingData: BloomingApiResponse['data']
  getTrendIcon: (trend: string) => React.ReactNode
}

export default function TabContent({ bloomingData, getTrendIcon }: TabContentProps) {
  return (
    <Tabs defaultValue="overview" className="h-full flex flex-col cursor-pointer">
      <TabsList className="grid w-full grid-cols-4 bg-white/10">
        <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
        <TabsTrigger value="trends" className="text-xs">Trends</TabsTrigger>
        <TabsTrigger value="insights" className="text-xs">Insights</TabsTrigger>
        <TabsTrigger value="decisions" className="text-xs">Decisions</TabsTrigger>
      </TabsList>
      
      <div className="flex-1 overflow-y-auto">
        <TabsContent value="overview" className="space-y-4 mt-4">
          <OverviewTab bloomingData={bloomingData} />
        </TabsContent>

        <TabsContent value="trends" className="space-y-4 mt-4">
          <TrendsTab bloomingData={bloomingData} getTrendIcon={getTrendIcon} />
        </TabsContent>

        <TabsContent value="insights" className="space-y-4 mt-4">
          <InsightsTab bloomingData={bloomingData} />
        </TabsContent>

        <TabsContent value="decisions" className="space-y-4 mt-4">
          <DecisionsTab bloomingData={bloomingData} />
        </TabsContent>
      </div>
      
      {/* Metadata */}
      <div className="text-white/60 text-xs border-t border-white/10 pt-2 mt-4">
        Last updated: {new Date(bloomingData.metadata.last_updated).toLocaleDateString()}
      </div>
    </Tabs>
  )
}
