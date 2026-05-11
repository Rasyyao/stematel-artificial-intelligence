import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'border-red-500/30 bg-red-500/10 text-red-300',
        pending: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-300',
        reviewed: 'border-blue-500/30 bg-blue-500/10 text-blue-300',
        good: 'border-green-500/30 bg-green-500/10 text-green-300',
        needs_improvement: 'border-red-500/30 bg-red-500/10 text-red-300',
        outline: 'border-white/20 text-white/70',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
