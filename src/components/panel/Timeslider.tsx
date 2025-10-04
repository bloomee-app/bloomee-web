'use client'

import React, { useState } from 'react'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function TimeSlider() {
  const [currentDate, setCurrentDate] = useState(new Date('2023-06-08'))

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const daysInCurrentMonth = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth())

  const handleDayChange = (value: number[]) => {
    const newDate = new Date(currentDate)
    newDate.setDate(value[0])
    setCurrentDate(newDate)
  }

  const handleMonthChange = (months: number) => {
    const newDate = new Date(currentDate)
    newDate.setMonth(newDate.getMonth() + months)
    setCurrentDate(newDate)
  }

  const handleYearChange = (years: number) => {
    const newDate = new Date(currentDate)
    newDate.setFullYear(newDate.getFullYear() + years)
    setCurrentDate(newDate)
  }

  return (
    <div className="flex flex-col gap-4 p-4 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 text-white shadow-lg w-[800px] max-w-[90vw]">
      {/* Year Navigator, Date Display, and Month Navigator */}
      <div className="grid grid-cols-3 items-center px-2">
        <div className="flex items-center justify-start gap-2">
          <Button size="icon" variant="ghost" className="text-white/60 hover:text-white" onClick={() => handleYearChange(-1)}>
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <span className="font-semibold text-xl">{currentDate.getFullYear()}</span>
          <Button size="icon" variant="ghost" className="text-white/60 hover:text-white" onClick={() => handleYearChange(1)}>
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="text-center font-mono text-xl tracking-wide">
          {currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </div>
        
        <div className="flex items-center justify-end gap-2">
          <Button size="icon" variant="ghost" className="text-white/60 hover:text-white" onClick={() => handleMonthChange(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="font-mono text-xl tracking-wide w-12 text-center">{currentDate.toLocaleDateString('en-US', { month: 'short' })}</span>
          <Button size="icon" variant="ghost" className="text-white/60 hover:text-white" onClick={() => handleMonthChange(1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Custom Slider  */}
      <div className="flex flex-col items-center justify-center p-2">
        <div className="relative w-full h-8 flex items-center px-2">
          <div className="flex-1 h-1 bg-blue-900/50 rounded-full relative" />
          
          <Slider
            value={[currentDate.getDate()]}
            max={daysInCurrentMonth}
            min={1}
            step={1}
            onValueChange={handleDayChange}
            className="absolute inset-0 cursor-pointer h-full"
          />
        </div>
        
      </div>
    </div>
  )
}