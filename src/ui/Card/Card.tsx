import { cva, VariantProps } from 'cva'
import React from 'react'

const card = cva(['border border-ds-gray-secondary'])
interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof card> {}

const CardRoot = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={card({ className })} {...props} />
  )
)
CardRoot.displayName = 'Card'

const header = cva(['border-b', 'border-ds-gray-secondary', 'p-5'])
interface HeaderProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof header> {}

const Header = React.forwardRef<HTMLDivElement, HeaderProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={header({ className })} {...props} />
  )
)
Header.displayName = 'Header'

const title = cva(['font-semibold'], {
  variants: {
    size: {
      base: ['text-base'],
      large: ['text-lg'],
    },
  },
  defaultVariants: {
    size: 'large',
  },
})
interface TitleProps
  extends React.HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof title> {}

const Title = React.forwardRef<HTMLParagraphElement, TitleProps>(
  ({ className, size, children, ...props }, ref) => (
    <h3 ref={ref} className={title({ className, size })} {...props}>
      {children}
    </h3>
  )
)
Title.displayName = 'title'

const description = cva()
interface DescriptionProps
  extends React.HTMLAttributes<HTMLParagraphElement>,
    VariantProps<typeof description> {}

const Description = React.forwardRef<HTMLParagraphElement, DescriptionProps>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={description({ className })} {...props} />
  )
)
Description.displayName = 'description'

const content = cva(['m-5'])
interface ContentProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof content> {}

const Content = React.forwardRef<HTMLDivElement, ContentProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={content({ className })} {...props} />
  )
)
Content.displayName = 'content'

const footer = cva(['border-t', 'border-ds-gray-secondary', 'p-5'])
interface FooterProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof footer> {}

const Footer = React.forwardRef<HTMLDivElement, FooterProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={footer({ className })} {...props} />
  )
)
Footer.displayName = 'footer'

export const Card = Object.assign(CardRoot, {
  Header,
  Title,
  Description,
  Content,
  Footer,
})
