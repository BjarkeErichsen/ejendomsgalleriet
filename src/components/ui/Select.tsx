'use client'

import { cn } from '@/lib/utils'

interface SelectProps {
  label?: string
  error?: string
  options: { value: string; label: string }[]
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void
  name?: string
  required?: boolean
  placeholder?: string
  className?: string
}

export function Select({
  label,
  error,
  options,
  value,
  onChange,
  name,
  required,
  placeholder,
  className,
}: SelectProps) {
  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className={cn(
          'w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm text-gray-900 transition-colors bg-white',
          'focus:border-green-700 focus:outline-none focus:ring-1 focus:ring-green-700',
          error && 'border-red-500 focus:border-red-500 focus:ring-red-500'
        )}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  )
}
