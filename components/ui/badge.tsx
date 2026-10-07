import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-md border border-transparent px-2.5 py-0.5 text-xs font-semibold tracking-wide whitespace-nowrap transition-[color,box-shadow,background-color] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3.5 shadow-2xs",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-xs [a&]:hover:bg-primary/90",
        secondary:
          "bg-secondary/90 text-secondary-foreground border border-secondary/20 [a&]:hover:bg-secondary",
        destructive:
          "bg-destructive/15 text-destructive-foreground border border-destructive/30 focus-visible:ring-destructive/20 dark:bg-destructive/30 dark:text-red-300 dark:border-destructive/50 dark:focus-visible:ring-destructive/40 [a&]:hover:bg-destructive/25",
        outline:
          "border-border/80 text-foreground bg-background/50 backdrop-blur-xs [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        ghost: "[a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        link: "text-primary underline-offset-4 [a&]:hover:underline",
        success: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-bold",
        warning: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 font-bold",
        info: "bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30 font-bold",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
