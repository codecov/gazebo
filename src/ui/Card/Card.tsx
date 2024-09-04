import { cva, VariantProps } from 'cva'
import React from 'react'

import { cn } from 'shared/utils/cn'

const card = cva(['border border-ds-gray-secondary bg-ds-container'])
interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof card> {}

const CardRoot = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn(card({ className }))} {...props} />
  )
)
CardRoot.displayName = 'Card'

const header = cva(['border-b', 'border-ds-gray-secondary', 'p-5'])
interface HeaderProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof header> {}

const Header = React.forwardRef<HTMLDivElement, HeaderProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn(header({ className }))} {...props} />
  )
)
Header.displayName = 'Card.Header'

const title = cva(['font-semibold'], {
  variants: {
    size: {
      base: ['text-base'],
      lg: ['text-lg'],
      xl: ['text-xl'],
    },
  },
  defaultVariants: {
    size: 'lg',
  },
})
interface TitleProps
  extends React.HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof title> {}

const Title = React.forwardRef<HTMLHeadingElement, TitleProps>(
  ({ className, size, children, ...props }, ref) => (
    <h3 ref={ref} className={cn(title({ className, size }))} {...props}>
      {children}
    </h3>
  )
)
Title.displayName = 'Card.Title'

const description = cva()
interface DescriptionProps
  extends React.HTMLAttributes<HTMLParagraphElement>,
    VariantProps<typeof description> {}

const Description = React.forwardRef<HTMLParagraphElement, DescriptionProps>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn(description({ className }))} {...props} />
  )
)
Description.displayName = 'Card.Description'

const content = cva(['m-5'])
interface ContentProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof content> {}

const Content = React.forwardRef<HTMLDivElement, ContentProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn(content({ className }))} {...props} />
  )
)
Content.displayName = 'Card.Content'

const footer = cva(['border-t', 'border-ds-gray-secondary', 'p-5'])
interface FooterProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof footer> {}

const Footer = React.forwardRef<HTMLDivElement, FooterProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn(footer({ className }))} {...props} />
  )
)
Footer.displayName = 'Card.Footer'

export const Card = Object.assign(CardRoot, {
  Header,
  Title,
  Description,
  Content,
  Footer,
})
