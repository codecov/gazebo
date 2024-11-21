import * as AccordionPrimitive from '@radix-ui/react-accordion'
import { cva, VariantProps } from 'cva'
import React, { forwardRef } from 'react'

import { cn } from 'shared/utils/cn'
import Icon from 'ui/Icon'

const root = cva([
  'divide-y divide-ds-gray-secondary border-y border-ds-gray-secondary',
])

const SummaryDropdownRoot = forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Root>
>(({ children, className, ...props }, forwardedRef) => (
  <AccordionPrimitive.Root
    className={cn(root({ className }))}
    {...props}
    ref={forwardedRef}
  >
    {children}
  </AccordionPrimitive.Root>
))

SummaryDropdownRoot.displayName = 'SummaryDropdownRoot'

interface ItemProps
  extends React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item> {}

const SummaryItem = forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  ItemProps
>(({ children, className, ...props }, forwardedRef) => (
  <AccordionPrimitive.Item
    className={cn({ className })}
    {...props}
    ref={forwardedRef}
  >
    {children}
  </AccordionPrimitive.Item>
))

SummaryItem.displayName = 'SummaryItem'

const trigger = cva(
  'flex w-full items-center gap-2 bg-ds-summary-container px-2 py-4 [&[data-state=open]>span:first-child]:rotate-90'
)

interface TriggerProps
  extends React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>,
    VariantProps<typeof trigger> {}

const SummaryTrigger = forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  TriggerProps
>(({ children, className, ...props }, forwardedRef) => (
  <AccordionPrimitive.Header className="sticky top-0 z-30">
    <AccordionPrimitive.Trigger
      ref={forwardedRef}
      className={cn(trigger({ className }))}
      {...props}
    >
      <span className="text-ds-gray-quinary transition-transform duration-200">
        <Icon variant="solid" size="md" name="chevronRight" />
      </span>
      {children}
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
))

SummaryTrigger.displayName = 'SummaryTrigger'

const content = cva(
  'data-[state=closed]:overflow-hidden data-[state=closed]:animate-slideUp data-[state=open]:animate-slideDown'
)

interface ContentProps
  extends React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>,
    VariantProps<typeof content> {}

const SummaryContent = forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  ContentProps
>(({ children, className, ...props }, forwardedRef) => (
  <AccordionPrimitive.Content
    className={cn(content({ className }))}
    {...props}
    ref={forwardedRef}
  >
    <div className="px-5">{children}</div>
  </AccordionPrimitive.Content>
))

SummaryContent.displayName = 'SummaryContent'

export const SummaryDropdown = Object.assign(SummaryDropdownRoot, {
  Item: SummaryItem,
  Trigger: SummaryTrigger,
  Content: SummaryContent,
})
