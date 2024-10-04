import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu'
import { cva, VariantProps } from 'cva'
import * as React from 'react'

import { cn } from 'shared/utils/cn'
import Icon from 'ui/Icon'

// NOTE: radix-ui's dropdown menu comes with more features such as submenus, separators, and different types of items.
// Check out https://www.radix-ui.com/primitives/docs/components/dropdown-menu to see what other functionality
// can be incorporated if needed.

const DropdownContext = React.createContext({ isOpen: false })

interface DropdownProps
  extends React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Root> {}

const Root = ({ ...props }: DropdownProps) => {
  const { defaultOpen = false } = props
  const [isOpen, setIsOpen] = React.useState(defaultOpen)
  const handleOpenChange = React.useCallback(
    (isOpen: boolean) => setIsOpen(isOpen),
    []
  )

  React.useEffect(() => {
    const handleBlur = () => setIsOpen(false)
    window.addEventListener('blur', handleBlur)

    return () => {
      window.removeEventListener('blur', handleBlur)
    }
  })

  return (
    <DropdownContext.Provider value={{ isOpen }}>
      <DropdownMenuPrimitive.Root
        {...props}
        open={isOpen}
        onOpenChange={handleOpenChange}
      />
    </DropdownContext.Provider>
  )
}
Root.displayName = 'Dropdown'

const trigger = cva('flex items-center gap-1')

interface TriggerProps
  extends React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Trigger>,
    VariantProps<typeof trigger> {}

const Trigger = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Trigger>,
  TriggerProps
>(({ children, className, ...props }, forwardedRef) => {
  const { isOpen } = React.useContext(DropdownContext)

  // below removes stray lingering outline after dropdown is closed
  // exhibited in safari + firefox (appears native to radix component)
  const ref = React.useRef<HTMLButtonElement | null>(null)
  const [wasJustClosed, setWasJustClosed] = React.useState(false)
  React.useEffect(() => {
    if (!isOpen) {
      setWasJustClosed(true)
      setTimeout(() => {
        ref.current?.blur()
        setWasJustClosed(false)
      }, 1000)
    }
  }, [isOpen])

  return (
    <DropdownMenuPrimitive.Trigger
      className={cn(
        trigger({ className }),
        'flex flex-1 items-center gap-1 whitespace-nowrap text-left focus:outline-1',
        wasJustClosed && 'focus:outline-none'
      )}
      ref={ref}
      {...props}
    >
      {children}
      <span
        aria-hidden="true"
        data-testid="dropdown-trigger-chevron"
        className={cn('transition-transform', {
          'rotate-180': isOpen,
          'rotate-0': !isOpen,
        })}
      >
        <Icon variant="solid" size="sm" name="chevronDown" />
      </span>
    </DropdownMenuPrimitive.Trigger>
  )
})
Trigger.displayName = 'Dropdown.Trigger'

const content = cva(
  'bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 min-w-32 overflow-hidden rounded-md border bg-ds-container shadow-md'
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
  'focus:bg-accent focus:text-accent-foreground relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm text-ds-gray-octonary outline-none transition-colors hover:cursor-pointer hover:bg-ds-gray-secondary data-[disabled]:pointer-events-none data-[disabled]:opacity-50'
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
