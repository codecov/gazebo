import { cva, VariantProps } from 'cva'
import * as React from 'react'

import { cn } from 'shared/utils/cn'
import Icon from 'ui/Icon'
import { OutlineIconCollection } from 'ui/Icon/Icon'

export const AlertOptions = {
  ERROR: 'error',
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
} as const

export type AlertOptionsType =
  | typeof AlertOptions.ERROR
  | typeof AlertOptions.INFO
  | typeof AlertOptions.SUCCESS
  | typeof AlertOptions.WARNING

const alertVariants = cva('relative w-full border-l-4 p-4', {
  variants: {
    variant: {
      [AlertOptions.ERROR]:
        'border-ds-primary-red bg-error-100 dark:bg-opacity-20',
      [AlertOptions.INFO]:
        'border-ds-blue-darker bg-ds-blue-nonary dark:bg-opacity-20',
      [AlertOptions.SUCCESS]:
        'border-green-500 bg-green-100 dark:bg-opacity-20',
      [AlertOptions.WARNING]:
        'border-orange-500 bg-orange-100 dark:bg-opacity-20',
    },
  },
  defaultVariants: {
    variant: AlertOptions.INFO,
  },
})

export function variantToIcon(
  variant?: string | null,
  customIconName?: keyof OutlineIconCollection | null
) {
  let className = 'float-left -mt-1 mr-2 align-middle'
  switch (variant) {
    case AlertOptions.ERROR:
      return (
        <Icon
          variant="outline"
          size="md"
          name={customIconName ?? 'xCircle'}
          data-testid="error"
          className={cn('stroke-ds-primary-red', className)}
        />
      )
    case AlertOptions.INFO:
      return (
        <Icon
          variant="outline"
          size="md"
          name={customIconName ?? 'informationCircle'}
          data-testid="info"
          className={cn('stroke-ds-blue-darker', className)}
        />
      )
    case AlertOptions.SUCCESS:
      return (
        <Icon
          variant="outline"
          size="md"
          name={customIconName ?? 'checkCircle'}
          data-testid="success"
          className={cn('stroke-green-500', className)}
        />
      )
    case AlertOptions.WARNING:
      return (
        <Icon
          variant="outline"
          size="md"
          name={customIconName ?? 'exclamationTriangle'}
          data-testid="warn"
          className={cn('stroke-orange-500', className)}
        />
      )
    default:
      return (
        <Icon
          variant="outline"
          size="md"
          name={customIconName ?? 'informationCircle'}
          data-testid="default"
          className={cn('stroke-ds-blue-darker', className)}
        />
      )
  }
}

interface RootProps
  extends React.HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof alertVariants> {
  customIconName?: keyof OutlineIconCollection
}

const AlertRoot = React.forwardRef<HTMLDivElement, RootProps>(
  ({ className, variant, customIconName, ...props }, ref) => (
    <div
      ref={ref}
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    >
      {variantToIcon(variant, customIconName)}
      {props.children}
    </div>
  )
)
AlertRoot.displayName = 'Alert'

const title = cva(['mb-1 font-semibold'])

interface TitleProps
  extends React.HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof title> {}

const Title = React.forwardRef<HTMLParagraphElement, TitleProps>(
  ({ className, children, ...props }, ref) => (
    <h5 ref={ref} className={cn(title({ className }))} {...props}>
      {children}
    </h5>
  )
)
Title.displayName = 'Alert.Title'

const description = cva(['text-sm'])

interface DescriptionProps
  extends React.HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof description> {}

const Description = React.forwardRef<HTMLParagraphElement, DescriptionProps>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn(description({ className }))} {...props} />
  )
)
Description.displayName = 'Alert.Description'

export const Alert = Object.assign(AlertRoot, {
  Image,
  Title,
  Description,
})
