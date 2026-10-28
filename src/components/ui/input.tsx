import * as React from 'react'

import { cn } from '@/lib/utils'

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      ref={ref}
      className={cn(
        'flex h-10 w-full rounded-[9px] border border-input bg-card px-3 text-[14px] text-foreground shadow-xs transition-[border-color,box-shadow] duration-150 hover:border-[#cfcfca]',
        'placeholder:text-muted-foreground/70',
        /* Bordure bleue et halo doux : le champ actif se voit d'un coup
           d'œil, sans que la mise en page bouge. */
        'focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/25 focus-visible:border-ring',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'file:mr-2.5 file:border-0 file:bg-transparent file:text-[0.78rem] file:font-medium file:text-foreground',
        className,
      )}
      {...props}
    />
  ),
)
Input.displayName = 'Input'

export { Input }
