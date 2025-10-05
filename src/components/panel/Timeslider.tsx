'use client'

import React, { useState, useEffect } from 'react'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Calendar, Minimize2, Maximize2, Flower } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '@/lib/store'

interface TimeSliderProps {
  className?: string
}

export default function TimeSlider({ className }: TimeSliderProps) {
  const { currentDate, setCurrentDate, bloomMode, setBloomMode } = useAppStore()
  const [isMinimized, setIsMinimized] = useState(false) 
  const [isLoaded, setIsLoaded] = useState(false)

  // Load saved state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem('timeSliderMinimized')
    if (savedState !== null) {
      setIsMinimized(JSON.parse(savedState))
    }
    setIsLoaded(true)
  }, [])

  // Save state to localStorage when it changes (only after initial load)
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('timeSliderMinimized', JSON.stringify(isMinimized))
    }
  }, [isMinimized, isLoaded])

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

  const toggleMinimized = () => {
    setIsMinimized(!isMinimized)
  }

  return (
    <div className="w-full flex justify-center">
      <motion.div
        layout
        layoutId="timeslider"
        className={cn(
          "flex items-center gap-3 p-3 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 text-white shadow-lg",
          className
        )}
        style={{
          width: isMinimized ? "auto" : "min(600px, 85vw)",
          transformOrigin: "center center"
        }}
        transition={{
          layout: {
            duration: 0.5,
            ease: [0.4, 0.0, 0.2, 1] // Custom cubic-bezier for smoother animation
          }
        }}
      >
      <AnimatePresence mode="wait">
        {isMinimized ? (
          <motion.div
            key="minimized"
            layout
            className="flex items-center gap-2"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ 
              opacity: 0, 
              scale: 0.8,
              transition: { 
                duration: 0.2,
                ease: [0.4, 0.0, 0.2, 1]
              }
            }}
            transition={{ 
              duration: 0.3,
              ease: [0.4, 0.0, 0.2, 1],
              delay: 0.1
            }}
          >
            <Calendar className="h-5 w-5" />
            <span className="font-mono text-sm">
              {currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
            <Button 
              size="icon" 
              variant="ghost" 
              className={cn(
                "h-6 w-6 !cursor-pointer transition-colors",
                bloomMode ? "text-green-400 hover:text-green-300" : "text-white/60 hover:text-white"
              )}
              onClick={() => setBloomMode(!bloomMode)}
              title={bloomMode ? "Disable bloom visualization" : "Enable bloom visualization"}
            >
              <Flower className="h-3 w-3" />
            </Button>
            <Button 
              size="icon" 
              variant="ghost" 
              className="text-white/60 hover:text-white h-6 w-6 !cursor-pointer" 
              onClick={toggleMinimized}
            >
              <Maximize2 className="h-3 w-3" />
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="expanded"
            layout
            className="flex items-center gap-3 w-full"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ 
              opacity: 0, 
              scale: 0.8,
              transition: { 
                duration: 0.2,
                ease: [0.4, 0.0, 0.2, 1]
              }
            }}
            transition={{ 
              duration: 0.3,
              ease: [0.4, 0.0, 0.2, 1],
              delay: 0.1
            }}
          >
            {/* Year Navigator */}
            <div className="flex items-center gap-1">
              <Button size="icon" variant="ghost" className="text-white/60 hover:text-white h-6 w-6 !cursor-pointer" onClick={() => handleYearChange(-1)}>
                <ChevronsLeft className="h-3 w-3" />
              </Button>
              <span className="font-semibold text-sm w-12 text-center">{currentDate.getFullYear()}</span>
              <Button size="icon" variant="ghost" className="text-white/60 hover:text-white h-6 w-6 !cursor-pointer" onClick={() => handleYearChange(1)}>
                <ChevronsRight className="h-3 w-3" />
              </Button>
            </div>

            {/* Month Navigator */}
            <div className="flex items-center gap-1">
              <Button size="icon" variant="ghost" className="text-white/60 hover:text-white h-6 w-6 !cursor-pointer" onClick={() => handleMonthChange(-1)}>
                <ChevronLeft className="h-3 w-3" />
              </Button>
              <span className="font-mono text-sm w-10 text-center">{currentDate.toLocaleDateString('en-US', { month: 'short' })}</span>
              <Button size="icon" variant="ghost" className="text-white/60 hover:text-white h-6 w-6 !cursor-pointer" onClick={() => handleMonthChange(1)}>
                <ChevronRight className="h-3 w-3" />
              </Button>
            </div>
            
            {/* Day Slider */}
            <div className="flex-1 flex items-center gap-2">
              <span className="text-xs text-white/60 font-mono">1</span>
              <div className="relative flex-1 h-6 flex items-center">
                <div className="flex-1 h-1 bg-blue-900/50 rounded-full" />
                <Slider
                  value={[currentDate.getDate()]}
                  max={daysInCurrentMonth}
                  min={1}
                  step={1}
                  onValueChange={handleDayChange}
                  className="absolute inset-0 !cursor-pointer h-full"
                />
              </div>
              <span className="text-xs text-white/60 font-mono">{daysInCurrentMonth}</span>
            </div>

            {/* Current Date Display */}
            <div className="text-center font-mono text-sm tracking-wide min-w-[80px]">
              {currentDate.getDate()}
            </div>

            {/* Bloom Toggle */}
            <Button 
              size="icon" 
              variant="ghost" 
              className={cn(
                "h-6 w-6 !cursor-pointer transition-colors",
                bloomMode ? "text-green-400 hover:text-green-300" : "text-white/60 hover:text-white"
              )}
              onClick={() => setBloomMode(!bloomMode)}
              title={bloomMode ? "Disable bloom visualization" : "Enable bloom visualization"}
            >
              <Flower className="h-3 w-3" />
            </Button>

            {/* Minimize Button */}
            <Button 
              size="icon" 
              variant="ghost" 
              className="text-white/60 hover:text-white h-6 w-6 !cursor-pointer" 
              onClick={toggleMinimized}
            >
              <Minimize2 className="h-3 w-3" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
      </motion.div>
    </div>
  )
}