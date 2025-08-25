import React, { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface DropdownProps {
  children: React.ReactNode
}

export const Dropdown: React.FC<DropdownProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {React.Children.map(children, child =>
        React.isValidElement(child)
          ? React.cloneElement(child, { isOpen, setIsOpen } as any)
          : child
      )}
    </div>
  )
}

interface DropdownToggleProps {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark'
  size?: 'sm' | 'lg'
  children: React.ReactNode
  isOpen?: boolean
  setIsOpen?: (open: boolean) => void
}

export const DropdownToggle: React.FC<DropdownToggleProps> = ({ 
  variant = 'primary',
  size = 'default',
  children,
  isOpen,
  setIsOpen
}) => {
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700',
    success: 'bg-green-600 text-white hover:bg-green-700',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    warning: 'bg-yellow-600 text-white hover:bg-yellow-700',
    info: 'bg-cyan-600 text-white hover:bg-cyan-700',
    light: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
    dark: 'bg-gray-800 text-white hover:bg-gray-900'
  }

  const sizeClasses = {
    sm: 'px-3 py-1 text-sm',
    default: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  }

  return (
    <button
      className={cn(
        'inline-flex items-center gap-2 rounded-md font-medium transition-colors',
        variantClasses[variant],
        sizeClasses[size]
      )}
      onClick={() => setIsOpen?.(!isOpen)}
    >
      {children}
      <svg 
        className={cn('w-4 h-4 transition-transform', isOpen && 'rotate-180')}
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  )
}

interface DropdownMenuProps {
  children: React.ReactNode
  isOpen?: boolean
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({ children, isOpen }) => {
  if (!isOpen) return null

  return (
    <div className="absolute top-full left-0 mt-1 min-w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
      {children}
    </div>
  )
}

interface DropdownItemProps {
  onClick?: () => void
  children: React.ReactNode
}

export const DropdownItem: React.FC<DropdownItemProps> = ({ onClick, children }) => {
  return (
    <button
      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 border-none bg-transparent"
      onClick={onClick}
    >
      {children}
    </button>
  )
}