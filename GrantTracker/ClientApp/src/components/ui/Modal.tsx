import React from 'react'
import { cn } from '@/lib/utils'

interface ModalProps {
  show: boolean
  onHide: () => void
  size?: 'sm' | 'lg' | 'xl'
  centered?: boolean
  children: React.ReactNode
}

export const Modal: React.FC<ModalProps> = ({ 
  show, 
  onHide, 
  size = 'lg', 
  centered = false, 
  children 
}) => {
  if (!show) return null

  const sizeClasses = {
    sm: 'max-w-md',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
      onClick={onHide}
    >
      <div 
        className={cn(
          'bg-white rounded-lg shadow-xl w-full',
          sizeClasses[size],
          centered && 'mx-auto'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}

interface ModalHeaderProps {
  closeButton?: boolean
  onHide?: () => void
  children: React.ReactNode
}

export const ModalHeader: React.FC<ModalHeaderProps> = ({ 
  closeButton = true, 
  onHide,
  children 
}) => {
  return (
    <div className="flex items-center justify-between p-6 border-b border-gray-200">
      {children}
      {closeButton && (
        <button
          className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          onClick={onHide}
        >
          ×
        </button>
      )}
    </div>
  )
}

interface ModalTitleProps {
  children: React.ReactNode
}

export const ModalTitle: React.FC<ModalTitleProps> = ({ children }) => {
  return (
    <h4 className="text-lg font-semibold text-gray-900">
      {children}
    </h4>
  )
}

interface ModalBodyProps {
  children: React.ReactNode
}

export const ModalBody: React.FC<ModalBodyProps> = ({ children }) => {
  return (
    <div className="p-6">
      {children}
    </div>
  )
}

interface ModalFooterProps {
  children: React.ReactNode
}

export const ModalFooter: React.FC<ModalFooterProps> = ({ children }) => {
  return (
    <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
      {children}
    </div>
  )
}