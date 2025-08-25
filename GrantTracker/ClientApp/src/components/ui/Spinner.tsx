import React from 'react'
import { cn } from '@/lib/utils'

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'default' | 'lg'
  variant?: 'border' | 'grow'
}

export const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, size = 'default', variant = 'border', ...props }, ref) => {
    const sizeClasses = {
      sm: 'w-4 h-4',
      default: 'w-8 h-8',
      lg: 'w-12 h-12'
    }

    const variantClasses = {
      border: 'border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin',
      grow: 'bg-blue-600 rounded-full animate-pulse'
    }

    return (
      <div
        ref={ref}
        className={cn(
          'inline-block',
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
        role="status"
        aria-label="Loading"
        {...props}
      />
    )
  }
)

Spinner.displayName = 'Spinner'