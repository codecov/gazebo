import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import React from 'react'

import { cn } from 'shared/utils/cn'
import Icon from 'ui/Icon'

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      'peer flex size-4 shrink-0 items-center justify-center rounded-sm border border-ds-gray-quinary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ds-blue-light focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-25 data-[state=checked]:border-ds-blue-default data-[state=checked]:bg-ds-blue-default data-[state=checked]:disabled:border-ds-gray-quinary data-[state=checked]:disabled:bg-ds-gray-quinary',
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn('flex size-3 items-center justify-center')}
    >
      <Icon
        className="[&_path]:stroke-white [&_path]:stroke-[4px]"
        name="check"
        size="sm"
        label="check"
        variant="outline"
      />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
))
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox as CheckboxNew }
