import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu'
import { cva, VariantProps } from 'cva'
import * as React from 'react'

import { cn } from 'shared/utils/cn'
import Icon from 'ui/Icon'

// NOTE: radix-ui's dropdown menu comes with more features such as submenus, separators, and different types of items.
// Check out https://www.radix-ui.com/primitives/docs/components/dropdown-menu to see what other functionality
// can be incorporated if needed.

// const root = cva(['flex gap-2'])

// interface DropdownProps
//   extends React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Root>, VariantProps<typeof root> {}
interface DropdownProps
  extends React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Root> {}

// Todo: remove React.forwardRef
const Root = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Root>,
  DropdownProps
>(({ ...props }, ref) => {
  return (
    <DropdownMenuPrimitive.Root
      // it doesn't look like this component excepts className or ref as props
      // className={cn(root({ className }))}
      {...props}
      // ref={ref}
    />
  )
})
Root.displayName = 'Dropdown'

const trigger = cva('flex items-center gap-1')

interface TriggerProps
  extends React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Trigger>,
    VariantProps<typeof trigger> {}

const Trigger = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Trigger>,
  TriggerProps
>(({ children, className, ...props }, forwardedRef) => (
  <DropdownMenuPrimitive.Trigger
    className={cn(trigger({ className }))}
    {...props}
  >
    {children}
    <span className="text-ds-gray-quinary">
      <Icon
        variant="solid"
        size="sm"
        name="chevronDown"
        className="text-ds-gray-octonary"
      />
    </span>
  </DropdownMenuPrimitive.Trigger>
))
Trigger.displayName = 'Dropdown.Trigger'

const content = cva(
  'bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 min-w-32 overflow-hidden rounded-md border p-1 shadow-md'
)

interface ContentProps
  extends React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>,
    VariantProps<typeof content> {}

const Content = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  ContentProps
>(({ className, sideOffset = 4, ...props }, ref) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(content({ className }))}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
))
Content.displayName = 'Dropdown.Content'

const item = cva(
  'focus:bg-accent focus:text-accent-foreground relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm text-ds-gray-octonary outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50'
)

interface ItemProps
  extends React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item>,
    VariantProps<typeof item> {}

const Item = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  ItemProps & { inset?: boolean }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    className={cn(inset && 'pl-8', item({ className }))}
    {...props}
  />
))
Item.displayName = 'Dropdown.Item'

const label = cva('px-2 py-1.5 text-sm font-semibold')

interface LabelProps
  extends React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label>,
    VariantProps<typeof label> {}

const Label = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Label>,
  LabelProps & { inset?: boolean }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Label
    ref={ref}
    className={cn(inset && 'pl-8', label({ className }))}
    {...props}
  />
))
Label.displayName = 'Dropdown.Label'

export const Dropdown = Object.assign(Root, {
  Trigger,
  Content,
  Item,
  Label,
})
