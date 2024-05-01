import * as RadioGroupPrimitive from '@radix-ui/react-radio-group'
import { cva, VariantProps } from 'cva'
import React from 'react'

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
      className={group({ className, direction })}
      {...props}
      ref={ref}
    />
  )
})
Group.displayName = RadioGroupPrimitive.Root.displayName

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
    VariantProps<typeof item> {
  label: string
  description?: string
}

const Item = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  ItemProps
>(({ className, label, description, flex, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={item({ className, flex })}
      {...props}
    >
      <div className="flex h-full flex-col gap-2 rounded-md border border-ds-gray-quaternary p-4">
        <div className="flex items-center justify-between gap-4">
          <p className="font-medium">{label}</p>
          <RadioButtonCircle />
        </div>
        {description ? (
          <p className="text-left text-ds-gray-quinary">{description}</p>
        ) : null}
      </div>
      <RadioGroupPrimitive.Indicator className="absolute right-0 top-0 flex h-full w-full justify-end">
        <div className="absolute h-full w-full rounded-md border-2 border-ds-blue" />
        <div className="h-full w-full rounded-md border border-ds-blue p-4">
          <div className="flex h-5 w-full items-center justify-end">
            <RadioButtonCircle selected />
          </div>
        </div>
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  )
})
Item.displayName = RadioGroupPrimitive.Item.displayName

export const RadioTileGroup = Object.assign(Group, {
  Item,
})

function RadioButtonCircle({ selected = false }: { selected?: boolean }) {
  return selected ? (
    <div className="flex h-4 w-4 items-center justify-center rounded-full bg-ds-blue">
      <div className="h-1 w-1 rounded-full bg-white " />
    </div>
  ) : (
    <div className="h-4 w-4 rounded-full border border-ds-gray-quaternary" />
  )
}
