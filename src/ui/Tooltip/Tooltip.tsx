//https://www.radix-ui.com/primitives/docs/components/tooltip
import * as RadixTooltip from '@radix-ui/react-tooltip'
import React, { forwardRef } from 'react'

import { cn } from 'shared/utils/cn'

const TooltipRoot: React.FC<RadixTooltip.TooltipProps> = ({
  children,
  ...props
}) => <RadixTooltip.Root {...props}>{children}</RadixTooltip.Root>

TooltipRoot.displayName = 'TooltipRoot'

const TooltipTrigger = forwardRef<
  React.ElementRef<typeof RadixTooltip.Trigger>,
  React.ComponentPropsWithoutRef<typeof RadixTooltip.Trigger>
>(({ children, className, ...props }, ref) => (
  <RadixTooltip.Trigger ref={ref} {...props} className={cn(className)} asChild>
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
  </RadixTooltip.Content>
))

TooltipContent.displayName = 'TooltipContent'

const TooltipArrow = forwardRef<
  React.ElementRef<typeof RadixTooltip.Arrow>,
  React.ComponentPropsWithoutRef<typeof RadixTooltip.Arrow>
>(({ ...props }, ref) => <RadixTooltip.Arrow ref={ref} {...props} />)

TooltipArrow.displayName = 'TooltipArrow'

export const Tooltip = Object.assign(TooltipRoot, {
  Trigger: TooltipTrigger,
  Content: TooltipContent,
  Arrow: TooltipArrow,
  Provider: RadixTooltip.Provider,
})
