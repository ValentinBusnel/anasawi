import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-[9px] text-[13.5px] font-medium tracking-[-0.005em] transition-[background-color,border-color,color,box-shadow,transform] duration-150 ease-out active:translate-y-px focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/30 disabled:pointer-events-none disabled:opacity-45 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        /* Une seule action principale par écran : bleu plein. */
        /* Un liseré clair en haut, une ombre d'un pixel : le bouton a de
           la matière sans effet décoratif. */
        default:
          'bg-primary text-primary-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_1px_2px_rgba(17,20,18,0.12)] hover:bg-[#3e667c]',
        destructive:
          'bg-destructive text-destructive-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_1px_2px_rgba(17,20,18,0.12)] hover:bg-[#9e2c25]',
        /* Les actions secondaires : contour, fond blanc. */
        outline:
          'border border-input bg-card text-foreground shadow-xs hover:border-[#cfcfca] hover:bg-secondary',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-[#e9e9e6]',
        ghost: 'text-ink-soft hover:bg-secondary hover:text-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        /* 36 px : une cible confortable au doigt comme à la souris. */
        default: 'h-9 px-3.5',
        sm: 'h-8 rounded-[8px] px-3 text-[13px]',
        lg: 'h-11 px-5 text-[14px]',
        icon: 'h-9 w-9',
        'icon-sm': 'h-8 w-8 rounded-[8px]',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  },
)
Button.displayName = 'Button'

export { Button, buttonVariants }
