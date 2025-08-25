import React from 'react'
import { cn } from '@/lib/utils'

interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  children: React.ReactNode
}

export const Form = React.forwardRef<HTMLFormElement, FormProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <form
        ref={ref}
        className={cn('space-y-4', className)}
        {...props}
      >
        {children}
      </form>
    )
  }
)

Form.displayName = 'Form'

interface FormGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export const FormGroup = React.forwardRef<HTMLDivElement, FormGroupProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('space-y-2', className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)

FormGroup.displayName = 'FormGroup'

interface FormLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode
}

export const FormLabel = React.forwardRef<HTMLLabelElement, FormLabelProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn(
          'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
          className
        )}
        {...props}
      >
        {children}
      </label>
    )
  }
)

FormLabel.displayName = 'FormLabel'

interface FormControlProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> {
  as?: 'input' | 'textarea' | 'select'
}

export const FormControl = React.forwardRef<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement, FormControlProps>(
  ({ className, as = 'input', ...props }, ref) => {
    const baseClasses = cn(
      'flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
      className
    )

    if (as === 'textarea') {
      return (
        <textarea
          className={cn(baseClasses, 'min-h-[80px] resize-vertical')}
          ref={ref as React.Ref<HTMLTextAreaElement>}
          {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      )
    }

    if (as === 'select') {
      return (
        <select
          className={baseClasses}
          ref={ref as React.Ref<HTMLSelectElement>}
          {...(props as React.SelectHTMLAttributes<HTMLSelectElement>)}
        />
      )
    }

    return (
      <input
        className={baseClasses}
        ref={ref as React.Ref<HTMLInputElement>}
        {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
      />
    )
  }
)

FormControl.displayName = 'FormControl'