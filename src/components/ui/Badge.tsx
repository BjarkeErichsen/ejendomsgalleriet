import { cn } from '@/lib/utils'

interface BadgeProps {
  variant?: 'default' | 'green' | 'blue' | 'orange' | 'red'
  children: React.ReactNode
  className?: string
}

const badgeVariants = {
  default: 'bg-gray-100 text-gray-700',
  green: 'bg-blue-100 text-blue-800',
  blue: 'bg-blue-100 text-blue-800',
  orange: 'bg-orange-100 text-orange-800',
  red: 'bg-red-100 text-red-800',
}

export function Badge({ variant = 'default', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        badgeVariants[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
