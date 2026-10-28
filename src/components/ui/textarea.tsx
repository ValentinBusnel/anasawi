import * as React from 'react'

import { cn } from '@/lib/utils'

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<'textarea'>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      'flex min-h-[88px] w-full resize-y rounded-[10px] border-0 bg-white px-3.5 py-[11px] text-[14px] leading-[1.55] text-foreground shadow-field transition-shadow duration-200 placeholder:text-[#b0bec1] hover:shadow-[var(--admin-field-shadow),0_0_0_1px_#dfe5e7]',
      'placeholder:text-muted-foreground/70',
      'focus-visible:outline-none focus-visible:shadow-[0_0_0_1.5px_#176c79,0_4px_14px_rgba(22,73,81,0.08)]',
      'disabled:cursor-not-allowed disabled:opacity-50',
      className,
    )}
    {...props}
  />
))
Textarea.displayName = 'Textarea'

export { Textarea }
