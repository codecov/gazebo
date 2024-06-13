import { cva, VariantProps } from 'cva'
import * as React from 'react'

import { cn } from 'shared/utils/cn'

import successImage from './assets/check-circle.svg'
import warningImage from './assets/exclamation.svg'
import infoImage from './assets/information-circle.svg'
import errorImage from './assets/x-circle.svg'

const alertVariants = cva(
  '[&>svg]:text-foreground relative w-full border-l-4 p-4 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg~*]:pl-7',
  {
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
  }
)

export function variantToIcon(variant?: string | null) {
  let alt = 'information circle'
  let src = infoImage
  switch (variant) {
    case 'error':
      alt = 'error'
      src = errorImage
      break
    case 'info':
      alt = 'information circle'
      src = infoImage
      break
    case 'success':
      alt = 'checkmark in circle'
      src = successImage
      break
    case 'warning':
      alt = 'triangle exclamation'
      src = warningImage
      break
  }
  return (
    <img className="float-left -mt-1 mr-2 align-middle" src={src} alt={alt} />
  )
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
