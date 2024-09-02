import { cva } from 'cva'
import React from 'react'

import { cn } from 'shared/utils/cn'

const statCard = cva([
  'flex',
  'flex-col',
  'gap-1',
  'bg-white',
  'border-r-2',
  'rounded-md',
  'w-44',
  'px-4',
])

interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {}

const StatCardRoot = React.forwardRef<HTMLDivElement, StatCardProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn(statCard({ className }))} {...props}>
      {children}
    </div>
  )
)
StatCardRoot.displayName = 'StatCard'

const header = cva(['flex', 'justify-between', 'items-center'])
const Header = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn(header({ className }))} {...props} />
))
Header.displayName = 'StatCard.Header'

const title = cva(['text-sm', 'font-semibold', 'text-gray-800'])
const Title = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, children, ...props }, ref) => (
  <h3 ref={ref} className={cn(title({ className }))} {...props}>
    {children}
  </h3>
))
Title.displayName = 'StatCard.Title'

const content = cva(['flex', 'items-center', 'gap-2', 'text-lg', 'font-light'])
const Content = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn(content({ className }))} {...props} />
))
Content.displayName = 'StatCard.Content'

const description = cva(['text-xs', 'text-gray-500'])
const Description = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn(description({ className }))} {...props} />
))
Description.displayName = 'StatCard.Description'

export const StatCard = Object.assign(StatCardRoot, {
  Header,
  Title,
  Content,
  Description,
})
