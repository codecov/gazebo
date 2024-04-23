import { cva, VariantProps } from 'cva'
import React from 'react'

const card = cva(['border border-ds-gray-secondary'])
interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof card> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={card({ className })} {...props} />
  )
)
Card.displayName = 'Card'

const cardHeader = cva(['border-b', 'border-ds-gray-secondary', 'p-5'])
interface CardHeaderProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardHeader> {}

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cardHeader({ className })} {...props} />
  )
)
CardHeader.displayName = 'CardHeader'

const cardTitle = cva(['text-lg', 'font-semibold'])
interface CardTitleProps
  extends React.HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof cardTitle> {}

const CardTitle = React.forwardRef<HTMLParagraphElement, CardTitleProps>(
  ({ className, children, ...props }, ref) => (
    <h3 ref={ref} className={cardTitle({ className })} {...props}>
      {children}
    </h3>
  )
)
CardTitle.displayName = 'CardTitle'

const cardDescription = cva()
interface CardDescriptionProps
  extends React.HTMLAttributes<HTMLParagraphElement>,
    VariantProps<typeof cardDescription> {}

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  CardDescriptionProps
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cardDescription({ className })} {...props} />
))
CardDescription.displayName = 'CardDescription'

const cardContent = cva(['m-5'])
interface CardContentProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardContent> {}

const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cardContent({ className })} {...props} />
  )
)
CardContent.displayName = 'CardContent'

const cardFooter = cva(['border-t', 'border-ds-gray-secondary', 'p-5'])
interface CardFooterProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardFooter> {}

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cardFooter({ className })} {...props} />
  )
)
CardFooter.displayName = 'CardFooter'

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter }
