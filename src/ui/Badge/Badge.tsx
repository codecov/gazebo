import cs from 'classnames'

const BadgeVariants = {
  default: 'bg-ds-pink-default text-white',
  danger: 'text-ds-primary-red border border-ds-primary-red',
  success: 'text-success-700 border border-success-700',
} as const

const SizeVariants = {
  xs: 'text-xs',
}

interface BadgeProps extends React.ComponentPropsWithoutRef<'span'> {
  variant?: keyof typeof BadgeVariants
  size?: keyof typeof SizeVariants
}

const Badge: React.FC<React.PropsWithChildren<BadgeProps>> = ({
  variant = 'default',
  size = 'xs',
  children,
  ...rest
}) => {
  return (
    <span
      className={cs(
        'px-2 rounded-lg w-fit',
        BadgeVariants[variant],
        SizeVariants[size]
      )}
      {...rest}
    >
      {children}
    </span>
  )
}

export default Badge
