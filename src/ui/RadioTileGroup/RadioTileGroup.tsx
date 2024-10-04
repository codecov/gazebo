import * as LabelPrimitive from '@radix-ui/react-label'
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group'
import { cva, VariantProps } from 'cva'
import React, { createContext, useContext, useId } from 'react'

import { cn } from 'shared/utils/cn'

const group = cva(['flex', 'gap-4'], {
  variants: {
    direction: {
      row: 'flex-row',
      col: 'flex-col',
    },
  },
  defaultVariants: {
    direction: 'row',
  },
})
interface GroupProps
  extends React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>,
    VariantProps<typeof group> {}

const Group = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  GroupProps
>(({ className, direction, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Root
      className={cn(group({ className, direction }))}
      {...props}
      ref={ref}
    />
  )
})
Group.displayName = 'RadioTileGroup'

const item = cva(['relative'], {
  variants: {
    flex: {
      1: 'flex-1',
      none: 'flex-none',
    },
  },
  defaultVariants: {
    flex: 1,
  },
})
interface ItemProps
  extends React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>,
    VariantProps<typeof item> {}
const ItemContext = createContext<string | null>(null)

const Item = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  ItemProps
>(({ children, className, flex, ...props }, ref) => {
  const itemId = useId()
  return (
    <RadioGroupPrimitive.Item
      id={itemId}
      ref={ref}
      className={cn(item({ className, flex }))}
      {...props}
    >
      <ItemContext.Provider value={itemId}>
        <div className="flex h-full flex-col justify-center gap-2 rounded-md border border-ds-gray-quaternary p-4">
          {children}
        </div>
        <RadioGroupPrimitive.Indicator className="absolute right-0 top-0 size-full rounded-md border-2 border-ds-blue-darker" />
      </ItemContext.Provider>
    </RadioGroupPrimitive.Item>
  )
})
Item.displayName = 'RadioTileGroup.Item'

const label = cva(['text-left font-medium'])
interface LabelProps
  extends React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>,
    VariantProps<typeof label> {}

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  LabelProps
>(({ className, ...props }, ref) => {
  const itemId = useContext(ItemContext)
  return (
    <div className="relative flex items-center justify-between gap-4">
      <LabelPrimitive.Root
        {...{ htmlFor: itemId ?? undefined }}
        ref={ref}
        className={cn(label({ className }))}
        {...props}
      />
      <RadioButtonCircle />
      <RadioGroupPrimitive.Indicator className="absolute right-0">
        <RadioButtonCircle selected />
      </RadioGroupPrimitive.Indicator>
    </div>
  )
})
Label.displayName = 'RadioTileGroup.Label'

const description = cva(['text-left text-ds-gray-quinary'])
interface DescriptionProps
  extends React.HTMLAttributes<HTMLParagraphElement>,
    VariantProps<typeof description> {}

const Description = React.forwardRef<HTMLParagraphElement, DescriptionProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <p ref={ref} className={cn(description({ className }))} {...props}>
        {children}
      </p>
    )
  }
)
Description.displayName = 'RadioTileGroup.Description'

function RadioButtonCircle({ selected = false }: { selected?: boolean }) {
  return selected ? (
    <div className="flex size-4 items-center justify-center rounded-full bg-ds-blue-darker">
      <div
        className="size-1 rounded-full bg-ds-container"
        data-testid="radio-button-circle-selected"
      />
    </div>
  ) : (
    <div
      className="size-4 flex-none rounded-full border border-ds-gray-quaternary"
      data-testid="radio-button-circle-unselected"
    />
  )
}

export const RadioTileGroup = Object.assign(Group, {
  Item,
  Label,
  Description,
})
