import { cva, type VariantProps } from 'cva'

import { cn } from 'shared/utils/cn'

const label = cva(
  'text-xs px-1 py-1.5 border-solid border rounded border-box inline-block',
  {
    variants: {
      variant: {
        default: 'border-current',
        subtle: 'border-ds-border-line text-ds-gray-senary bg-ds-gray-primary',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

interface LabelProps extends VariantProps<typeof label> {}

const Label: React.FC<React.PropsWithChildren<LabelProps>> = ({
  children,
  variant,
}) => {
  return <span className={cn(label({ variant }))}>{children}</span>
}

export default Label
