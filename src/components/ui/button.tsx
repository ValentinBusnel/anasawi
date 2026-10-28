import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-[8px] text-[14px] font-medium transition-[opacity,background-color,box-shadow,transform] duration-[250ms] ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        /* Une seule action principale par écran : bleu plein. */
        /* Un liseré clair en haut, une ombre d'un pixel : le bouton a de
           la matière sans effet décoratif. */
        /* Comme sur l'espace Qeeps : aplat plein, qui s'éclaircit au
           survol et s'enfonce d'un rien au clic. */
        default: 'bg-primary text-primary-foreground hover:opacity-85',
        destructive: 'bg-destructive text-destructive-foreground hover:opacity-85',
        /* Secondaire : un liseré, pas de fond. */
        outline:
          'bg-transparent text-foreground shadow-[inset_0_0_0_1px_var(--color-border)] hover:bg-[rgba(22,73,81,0.04)]',
        secondary: 'bg-white text-foreground shadow-field hover:shadow-[var(--admin-field-shadow),0_0_0_1px_#dfe5e7]',
        ghost: 'text-foreground hover:bg-[rgba(22,73,81,0.05)]',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        /* 36 px : une cible confortable au doigt comme à la souris. */
        default: 'h-10 px-4',
        sm: 'h-8 rounded-[6px] px-3 text-[13px]',
        lg: 'h-11 px-5 text-[15px]',
        icon: 'h-9 w-9 rounded-[9px]',
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
