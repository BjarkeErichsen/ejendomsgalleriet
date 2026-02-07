'use client'

import { cn } from '@/lib/utils'

interface InputProps {
  label?: string
  error?: string
  type?: string
  placeholder?: string
  value?: string | number
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  name?: string
  required?: boolean
  className?: string
  disabled?: boolean
  suffix?: string
}

export function Input({
  label,
  error,
  type = 'text',
  placeholder,
  value,
  onChange,
  name,
  required,
  className,
  disabled,
  suffix,
}: InputProps) {
  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          id={name}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          className={cn(
            'w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition-colors',
            'focus:border-green-700 focus:outline-none focus:ring-1 focus:ring-green-700',
            'disabled:bg-gray-50 disabled:text-gray-500',
            suffix && 'pr-16',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500'
          )}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
            {suffix}
          </span>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  )
}
