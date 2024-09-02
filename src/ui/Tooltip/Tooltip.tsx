//https://www.radix-ui.com/primitives/docs/components/tooltip
import * as RadixTooltip from '@radix-ui/react-tooltip'
import React, { forwardRef } from 'react'

import { cn } from 'shared/utils/cn'

const TooltipProvider: React.FC<RadixTooltip.TooltipProviderProps> = ({
  children,
  ...props
}) => <RadixTooltip.Provider {...props}>{children}</RadixTooltip.Provider>

TooltipProvider.displayName = 'TooltipProvider'

const TooltipRoot: React.FC<RadixTooltip.TooltipProps> = ({
  children,
  ...props
}) => <RadixTooltip.Root {...props}>{children}</RadixTooltip.Root>

TooltipRoot.displayName = 'TooltipRoot'

const TooltipTrigger = forwardRef<
  React.ElementRef<typeof RadixTooltip.Trigger>,
  React.ComponentPropsWithoutRef<typeof RadixTooltip.Trigger>
>(({ children, className, ...props }, ref) => (
  <RadixTooltip.Trigger ref={ref} {...props} className={className}>
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
      'bg-gray-800 px-3 py-2 text-sm text-white shadow-md',
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
>(({ className, ...props }, ref) => (
  <RadixTooltip.Arrow ref={ref} {...props} className={className} />
))

TooltipArrow.displayName = 'TooltipArrow'

const TooltipPortal: React.FC<RadixTooltip.TooltipPortalProps> = ({
  children,
  ...props
}) => <RadixTooltip.Portal {...props}>{children}</RadixTooltip.Portal>

TooltipPortal.displayName = 'TooltipPortal'

export const Tooltip = Object.assign(TooltipProvider, {
  Root: TooltipRoot,
  Trigger: TooltipTrigger,
  Content: TooltipContent,
  Arrow: TooltipArrow,
  Portal: TooltipPortal,
})
