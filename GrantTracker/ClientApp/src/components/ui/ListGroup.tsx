import React from 'react'
import { cn } from '@/lib/utils'

interface ListGroupProps {
  children: React.ReactNode
  className?: string
}

export const ListGroup: React.FC<ListGroupProps> = ({ children, className }) => {
  return (
    <ul 
      className={cn(
        'bg-white border border-gray-200 rounded-md divide-y divide-gray-200',
        className
      )}
    >
      {children}
    </ul>
  )
}

interface ListGroupItemProps {
  active?: boolean
  disabled?: boolean
  onClick?: () => void
  children: React.ReactNode
  className?: string
}

export const ListGroupItem: React.FC<ListGroupItemProps> = ({ 
  active = false,
  disabled = false,
  onClick,
  children,
  className
}) => {
  const Component = onClick ? 'button' : 'li'
  
  return (
    <Component
      className={cn(
        'px-4 py-3 text-sm',
        onClick && 'w-full text-left hover:bg-gray-50',
        active && 'bg-blue-50 text-blue-700 border-blue-200',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      onClick={!disabled ? onClick : undefined}
      disabled={disabled}
    >
      {children}
    </Component>
  )
}