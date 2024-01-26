import * as AccordionPrimitive from '@radix-ui/react-accordion'
import cs from 'classnames'
import { forwardRef } from 'react'

import Icon from 'ui/Icon'

const SummaryDropdownRoot = forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Root>
>(({ children, className, ...props }, forwardedRef) => (
  <AccordionPrimitive.Root
    className={cs(
      'divide-y divide-ds-gray-secondary border-ds-gray-secondary border-y',
      className
    )}
    {...props}
    ref={forwardedRef}
  >
    {children}
  </AccordionPrimitive.Root>
))

SummaryDropdownRoot.displayName = 'SummaryDropdownRoot'

const SummaryItem = forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ children, className, ...props }, forwardedRef) => (
  <AccordionPrimitive.Item
    className={cs(className)}
    {...props}
    ref={forwardedRef}
  >
    {children}
  </AccordionPrimitive.Item>
))

SummaryItem.displayName = 'SummaryItem'

const SummaryTrigger = forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ children, className, ...props }, forwardedRef) => (
  <AccordionPrimitive.Header className="sticky top-0 z-30">
    <AccordionPrimitive.Trigger
      className={cs(
        'flex w-full items-center gap-2 bg-ds-gray-primary px-2 py-4 [&[data-state=open]>span:first-child]:rotate-90',
        className
      )}
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

const SummaryContent = forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ children, className, ...props }, forwardedRef) => (
  <AccordionPrimitive.Content
    className={cs(
      'data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp overflow-hidden',
      className
    )}
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
