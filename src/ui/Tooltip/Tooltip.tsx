import * as RadixTooltip from '@radix-ui/react-tooltip'
import React, { forwardRef } from 'react'

import { cn } from 'shared/utils/cn'

const TooltipRoot = forwardRef<
  React.ElementRef<typeof RadixTooltip.Root>,
  React.ComponentPropsWithoutRef<typeof RadixTooltip.Root>
>(({ children, ...props }) => (
  <RadixTooltip.Root {...props}>{children}</RadixTooltip.Root>
))

TooltipRoot.displayName = 'TooltipRoot'

const TooltipTrigger = forwardRef<
  React.ElementRef<typeof RadixTooltip.Trigger>,
  React.ComponentPropsWithoutRef<typeof RadixTooltip.Trigger>
>(({ children, className, ...props }, ref) => (
  <RadixTooltip.Trigger ref={ref} {...props} className={cn(className)}>
    {children}
  </RadixTooltip.Trigger>
))

TooltipTrigger.displayName = 'TooltipTrigger'

interface TooltipContentProps
  extends React.ComponentPropsWithoutRef<typeof RadixTooltip.Content> {
  sideOffset?: number
}

const TooltipContent = forwardRef<
  React.ElementRef<typeof RadixTooltip.Content>,
  TooltipContentProps
>(({ children, className, sideOffset = 5, ...props }, ref) => (
  <RadixTooltip.Content
    ref={ref}
    sideOffset={sideOffset}
    {...props}
    className={cn(
      'rounded bg-gray-800 px-3 py-2 text-sm text-white shadow-md',
      className
    )}
  >
    {children}
    <RadixTooltip.Arrow className="fill-gray-800" />
  </RadixTooltip.Content>
))

TooltipContent.displayName = 'TooltipContent'

const TooltipArrow = forwardRef<
  React.ElementRef<typeof RadixTooltip.Arrow>,
  React.ComponentPropsWithoutRef<typeof RadixTooltip.Arrow>
>(({ className, ...props }, ref) => (
  <RadixTooltip.Arrow
    ref={ref}
    {...props}
    className={cn('fill-gray-800', className)}
  />
))

TooltipArrow.displayName = 'TooltipArrow'

export const Tooltip = Object.assign(TooltipRoot, {
  Trigger: TooltipTrigger,
  Content: TooltipContent,
  Arrow: TooltipArrow,
  Provider: RadixTooltip.Provider,
})
