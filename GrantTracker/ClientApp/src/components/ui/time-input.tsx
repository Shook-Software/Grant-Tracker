import React, { forwardRef, useEffect, useState, useRef } from 'react'
import { LocalTime } from '@js-joda/core'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'

interface TimeInputProps extends Omit<React.ComponentProps<typeof Select>, 'value' | 'onValueChange'> {
  value: LocalTime
  onChange: (time: LocalTime) => void
  step?: number // in minutes, defaults to 15
  className?: string
}

const TimeInput = forwardRef<HTMLButtonElement, TimeInputProps>(
  ({ value, onChange, step = 15, className, ...props }, ref) => {
    // Generate all valid time options based on step
    const generateTimeOptions = (stepMinutes: number): { value: string; label: string; time: LocalTime }[] => {
      const options = []
      const totalSteps = (24 * 60) / stepMinutes
      
      for (let i = 0; i < totalSteps; i++) {
        const totalMinutes = i * stepMinutes
        const hours = Math.floor(totalMinutes / 60)
        const minutes = totalMinutes % 60
        
        const time = LocalTime.of(hours, minutes)
        const value = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
        
        // Format display with AM/PM
        let displayHour = hours
        const ampm = hours >= 12 ? 'PM' : 'AM'
        
        if (displayHour === 0) displayHour = 12
        else if (displayHour > 12) displayHour = displayHour - 12
        
        const label = `${displayHour}:${minutes.toString().padStart(2, '0')} ${ampm}`
        
        options.push({ value, label, time })
      }
      
      return options
    }

    const timeOptions = generateTimeOptions(step)
    
    // Convert LocalTime to string value for Select
    const timeToValue = (time: LocalTime): string => {
      return `${time.hour().toString().padStart(2, '0')}:${time.minute().toString().padStart(2, '0')}`
    }
    
    // Convert string value to LocalTime
    const valueToTime = (valueStr: string): LocalTime => {
      const [hourStr, minuteStr] = valueStr.split(':')
      return LocalTime.of(parseInt(hourStr, 10), parseInt(minuteStr, 10))
    }

    const currentValue = timeToValue(value)
    
    const handleValueChange = (newValue: string) => {
      const newTime = valueToTime(newValue)
      if (!newTime.equals(value)) {
        onChange(newTime)
      }
    }

    return (
      <Select
        value={currentValue}
        onValueChange={handleValueChange}
        {...props}
      >
        <SelectTrigger 
          ref={ref} 
          className={cn("font-mono", className)}
          aria-label="Select time"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="max-h-60 overflow-y-auto">
          {timeOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    )
  }
)

TimeInput.displayName = 'TimeInput'

export { TimeInput }
export type { TimeInputProps }