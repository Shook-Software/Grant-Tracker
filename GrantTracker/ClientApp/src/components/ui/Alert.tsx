import React from 'react'
import { cn } from '@/lib/utils'

interface AlertProps {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark'
  dismissible?: boolean
  onClose?: () => void
  children: React.ReactNode
  className?: string
}

export const Alert: React.FC<AlertProps> = ({ 
  variant = 'primary',
  dismissible = false,
  onClose,
  children,
  className
}) => {
  const variantClasses = {
    primary: 'bg-blue-50 text-blue-800 border-blue-200',
    secondary: 'bg-gray-50 text-gray-800 border-gray-200',
    success: 'bg-green-50 text-green-800 border-green-200',
    danger: 'bg-red-50 text-red-800 border-red-200',
    warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    info: 'bg-cyan-50 text-cyan-800 border-cyan-200',
    light: 'bg-gray-50 text-gray-800 border-gray-200',
    dark: 'bg-gray-800 text-white border-gray-700'
  }

  return (
    <div 
      className={cn(
        'p-4 rounded-md border flex items-center justify-between',
        variantClasses[variant],
        className
      )}
    >
      <div className="flex-1">
        {children}
      </div>
      {dismissible && (
        <button
          className="ml-4 text-current hover:opacity-75"
          onClick={onClose}
        >
          ×
        </button>
      )}
    </div>
  )
}