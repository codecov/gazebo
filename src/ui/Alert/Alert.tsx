import { cva, VariantProps } from 'cva'
import * as React from 'react'

import { cn } from 'shared/utils/cn'
import Icon from 'ui/Icon'

export enum AlertOptions {
  ERROR = 'error',
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
}

const alertVariants = cva('relative w-full border-l-4 p-4', {
  variants: {
    variant: {
      [AlertOptions.ERROR]: 'border-ds-primary-red bg-error-100',
      [AlertOptions.INFO]: 'border-ds-blue-darker bg-ds-blue-nonary',
      [AlertOptions.SUCCESS]: 'border-green-500 bg-green-100',
      [AlertOptions.WARNING]: 'border-orange-500 bg-orange-100',
    },
  },
  defaultVariants: {
    variant: AlertOptions.INFO,
  },
})

export function variantToIcon(variant?: string | null) {
  let classname = 'float-left -mt-1 mr-2 align-middle'
  switch (variant) {
    case AlertOptions.ERROR:
      return (
        <Icon
          variant="outline"
          size="md"
          name="xCircle"
          data-testid="error"
          className={`stroke-ds-primary-red ${classname}`}
        />
      )
    case AlertOptions.INFO:
      return (
        <Icon
          variant="outline"
          size="md"
          name="informationCircle"
          data-testid="info"
          className={`stroke-ds-blue-darker ${classname}`}
        />
      )
    case AlertOptions.SUCCESS:
      return (
        <Icon
          variant="outline"
          size="md"
          name="checkCircle"
          data-testid="success"
          className={`stroke-green-500 ${classname}`}
        />
      )
    case AlertOptions.WARNING:
      return (
        <Icon
          variant="outline"
          size="md"
          name="exclamationTriangle"
          data-testid="warn"
          className={`stroke-orange-500 ${classname}`}
        />
      )
    default:
      return (
        <Icon
          variant="outline"
          size="md"
          name="informationCircle"
          data-testid="default"
          className={`stroke-ds-blue-darker ${classname}`}
        />
      )
  }
}

interface RootProps
  extends React.HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof alertVariants> {}

const AlertRoot = React.forwardRef<HTMLDivElement, RootProps>(
  ({ className, variant, ...props }, ref) => (
    <div
      ref={ref}
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    >
      {variantToIcon(variant)}
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
