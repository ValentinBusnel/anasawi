import * as React from 'react'

import { cn } from '@/lib/utils'

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<'textarea'>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      'flex min-h-[88px] w-full resize-y rounded-[9px] border border-input bg-card px-3 py-2.5 text-[14px] leading-[1.6] text-foreground shadow-xs transition-[border-color,box-shadow] duration-150 hover:border-[#cfcfca]',
      'placeholder:text-muted-foreground/70',
      'focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/25 focus-visible:border-ring',
      'disabled:cursor-not-allowed disabled:opacity-50',
      className,
    )}
    {...props}
  />
))
Textarea.displayName = 'Textarea'

export { Textarea }
