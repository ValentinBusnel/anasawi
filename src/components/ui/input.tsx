import * as React from 'react'

import { cn } from '@/lib/utils'

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      ref={ref}
      className={cn(
        'flex h-[42px] w-full rounded-[10px] border-0 bg-white px-3.5 text-[14px] text-foreground shadow-field transition-shadow duration-200 hover:shadow-[var(--admin-field-shadow),0_0_0_1px_#dfe5e7]',
        'placeholder:text-[#b0bec1]',
        /* Bordure bleue et halo doux : le champ actif se voit d'un coup
           d'œil, sans que la mise en page bouge. */
        'focus-visible:outline-none focus-visible:shadow-[0_0_0_1.5px_#176c79,0_4px_14px_rgba(22,73,81,0.08)]',
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
