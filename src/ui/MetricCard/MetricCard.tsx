import { cva } from 'cva'
import React from 'react'

import { cn } from 'shared/utils/cn'

const metricCard = cva(['flex', 'flex-col', 'gap-1', 'px-4'])

// this interface is being temporarily commented out, if we need to add custom
// props to MetricCardProps, we can uncomment it and remove the type below
// interface MetricCardProps extends React.HTMLAttributes<HTMLDivElement> {}
type MetricCardProps = React.HTMLAttributes<HTMLDivElement>

const MetricCardRoot = React.forwardRef<HTMLDivElement, MetricCardProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn(metricCard({ className }))} {...props}>
      {children}
    </div>
  )
)
MetricCardRoot.displayName = 'MetricCard'

const header = cva(['flex', 'justify-between', 'items-center'])
const Header = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn(header({ className }))} {...props} />
))
Header.displayName = 'MetricCard.Header'

const title = cva(['text-sm', 'font-semibold', 'text-ds-gray-octonary'])
const Title = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, children, ...props }, ref) => (
  <h3 ref={ref} className={cn(title({ className }))} {...props}>
    {children}
  </h3>
))
Title.displayName = 'MetricCard.Title'

const content = cva(['flex', 'items-center', 'gap-2', 'text-lg', 'font-light'])
const Content = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn(content({ className }))} {...props} />
))
Content.displayName = 'MetricCard.Content'

const description = cva(['text-xs', 'text-ds-gray-quinary'])
const Description = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn(description({ className }))} {...props} />
))
Description.displayName = 'MetricCard.Description'

export const MetricCard = Object.assign(MetricCardRoot, {
  Header,
  Title,
  Content,
  Description,
})
