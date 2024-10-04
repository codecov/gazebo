import * as Collapsible from '@radix-ui/react-collapsible'
import React, { forwardRef, ReactNode } from 'react'

import { cn } from 'shared/utils/cn'
import Icon from 'ui/Icon'

const ExpandableSectionRoot = forwardRef<
  React.ElementRef<typeof Collapsible.Root>,
  React.ComponentPropsWithoutRef<typeof Collapsible.Root>
>(({ children, className, ...props }, ref) => (
  <Collapsible.Root
    className={cn('my-2 border border-ds-gray-secondary', className)}
    {...props}
    ref={ref}
  >
    {children}
  </Collapsible.Root>
))

ExpandableSectionRoot.displayName = 'ExpandableSectionRoot'

interface ExpandableSectionTriggerProps
  extends React.ComponentPropsWithoutRef<typeof Collapsible.Trigger> {
  children: ReactNode
}

const ExpandableSectionTrigger = forwardRef<
  React.ElementRef<typeof Collapsible.Trigger>,
  ExpandableSectionTriggerProps
>(({ className, children, ...props }, ref) => {
  return (
    <Collapsible.Trigger
      className={cn(
        'flex w-full items-center justify-between p-4 text-left hover:bg-ds-gray-primary',
        '[&_#expandable-icon]:data-[state=open]:rotate-180',
        className
      )}
      {...props}
      ref={ref}
    >
      <span>{children}</span>
      <span id="expandable-icon" className="rotate-0 transition-transform">
        <Icon name="chevronUp" size="sm" />
      </span>
    </Collapsible.Trigger>
  )
})

ExpandableSectionTrigger.displayName = 'ExpandableSectionTrigger'

const ExpandableSectionContent = forwardRef<
  React.ElementRef<typeof Collapsible.Content>,
  React.ComponentPropsWithoutRef<typeof Collapsible.Content>
>(({ children, className, ...props }, ref) => (
  <Collapsible.Content
    className={cn('border-t border-ds-gray-secondary p-4', className)}
    {...props}
    ref={ref}
  >
    {children}
  </Collapsible.Content>
))

ExpandableSectionContent.displayName = 'ExpandableSectionContent'

export const ExpandableSection = Object.assign(ExpandableSectionRoot, {
  Trigger: ExpandableSectionTrigger,
  Content: ExpandableSectionContent,
})
