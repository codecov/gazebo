import { cva, VariantProps } from 'cva'
import * as React from 'react'

import { cn } from 'shared/utils/cn'
import Icon from 'ui/Icon'

const alertVariants = cva('relative w-full border-l-4 p-4', {
  variants: {
    variant: {
      error: 'border-ds-primary-red bg-error-100',
      info: 'border-ds-blue-darker bg-ds-blue-nonary',
      success: 'border-green-500 bg-green-100',
      warning: 'border-orange-500 bg-orange-100',
    },
  },
  defaultVariants: {
    variant: 'info',
  },
})

export function variantToIcon(variant?: string | null) {
  let classname = 'float-left -mt-1 mr-2 align-middle'
  switch (variant) {
    case 'error':
      return (
        <Icon
          variant="outline"
          size="md"
          name="xCircle"
          className={`stroke-ds-primary-red ${classname}`}
        />
      )
    case 'info':
      return (
        <Icon
          variant="outline"
          size="md"
          name="informationCircle"
          className={`stroke-ds-blue-darker ${classname}`}
        />
      )
    case 'success':
      return (
        <Icon
          variant="outline"
          size="md"
          name="checkCircle"
          className={`stroke-green-500 ${classname}`}
        />
      )
    case 'warning':
      return (
        <Icon
          variant="outline"
          size="md"
          name="exclamationTriangle"
          className={`stroke-orange-500 ${classname}`}
        />
      )
    default:
      return (
        <Icon
          variant="outline"
          size="md"
          name="informationCircle"
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

const title = cva(['mb-1 font-semibold leading-none tracking-tight'])

interface TitleProps
  extends React.HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof title> {}

const Title = React.forwardRef<HTMLParagraphElement, TitleProps>(
  ({ className, ...props }, ref) => (
    // eslint-disable-next-line jsx-a11y/heading-has-content
    <h5 ref={ref} className={cn(title({ className }))} {...props} />
  )
)
Title.displayName = 'Alert.Title'

const description = cva(['text-sm [&_p]:leading-relaxed'])

interface DescriptionProps
  extends React.HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof description> {}

const Description = React.forwardRef<HTMLParagraphElement, DescriptionProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn(description({ className }))} {...props} />
  )
)
Description.displayName = 'Alert.Description'

export const Alert = Object.assign(AlertRoot, {
  Image,
  Title,
  Description,
})
