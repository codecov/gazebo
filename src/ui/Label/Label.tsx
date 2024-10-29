import { cva, type VariantProps } from 'cva'

import { cn } from 'shared/utils/cn'

const label = cva(
  'text-xs px-1 py-1.5 border-solid border rounded border-box inline-block',
  {
    variants: {
      variant: {
        default: 'border-current',
        subtle: 'border-ds-border-line text-ds-gray-senary bg-ds-gray-primary',
        plain:
          'py-0.5 border-ds-gray-tertiary text-ds-gray-senary dark:bg-ds-gray-tertiary dark:text-ds-secondary-text',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

interface LabelProps extends VariantProps<typeof label> {
  className?: string
}

const Label: React.FC<React.PropsWithChildren<LabelProps>> = ({
  children,
  variant,
  className,
}) => {
  return <span className={cn(label({ variant, className }))}>{children}</span>
}

export default Label
