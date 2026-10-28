import * as React from 'react'

import { cn } from '@/lib/utils'

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<'textarea'>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      'flex min-h-[88px] w-full resize-y rounded-[10px] border-0 bg-white px-3.5 py-[11px] text-[14px] leading-[1.55] text-foreground shadow-field transition-shadow duration-200 placeholder:text-[#a9bac1] hover:shadow-[0_0_0_1px_#d3dcdf,0_1px_2px_rgba(33,58,71,0.05)]',
      'placeholder:text-muted-foreground/70',
      'focus-visible:outline-none focus-visible:shadow-[0_0_0_1.5px_#46728a,0_4px_14px_rgba(33,58,71,0.08)]',
      'disabled:cursor-not-allowed disabled:opacity-50',
      className,
    )}
    {...props}
  />
))
Textarea.displayName = 'Textarea'

export { Textarea }
