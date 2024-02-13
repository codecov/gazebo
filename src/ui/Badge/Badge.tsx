import cs from 'classnames'

const BadgeVariants = {
  default: 'bg-ds-pink text-white',
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
