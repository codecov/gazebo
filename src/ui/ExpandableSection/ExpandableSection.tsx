import * as Collapsible from '@radix-ui/react-collapsible'
import cs from 'classnames'
import React, { forwardRef, ReactNode } from 'react'

import Icon from 'ui/Icon'

const ExpandableSectionRoot = forwardRef<
  React.ElementRef<typeof Collapsible.Root>,
  React.ComponentPropsWithoutRef<typeof Collapsible.Root>
>(({ children, className, ...props }, ref) => (
  <Collapsible.Root
    className={cs('my-2 border border-gray-200', className)}
    {...props}
    ref={ref}
  >
    {children}
  </Collapsible.Root>
))

ExpandableSectionRoot.displayName = 'ExpandableSectionRoot'

interface ExpandableSectionTriggerProps
  extends React.ComponentPropsWithoutRef<typeof Collapsible.Trigger> {
  isExpanded: boolean
  children: ReactNode
}

const ExpandableSectionTrigger = forwardRef<
  React.ElementRef<typeof Collapsible.Trigger>,
  ExpandableSectionTriggerProps
>(({ isExpanded, className, children, ...props }, ref) => (
  <Collapsible.Trigger asChild>
    <button
      className={cs(
        'flex w-full items-center justify-between p-4 text-left font-semibold hover:bg-gray-100',
        className
      )}
      {...props}
      ref={ref}
    >
      <span>{children}</span>
      <Icon name={isExpanded ? 'chevronUp' : 'chevronDown'} size="sm" />
    </button>
  </Collapsible.Trigger>
))

ExpandableSectionTrigger.displayName = 'ExpandableSectionTrigger'

const ExpandableSectionContent = forwardRef<
  React.ElementRef<typeof Collapsible.Content>,
  React.ComponentPropsWithoutRef<typeof Collapsible.Content>
>(({ children, className, ...props }, ref) => (
  <Collapsible.Content
    className={cs('border-t border-gray-200 p-4', className)}
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
