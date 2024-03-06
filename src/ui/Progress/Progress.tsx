import cs from 'classnames'

import TotalsNumber from '../TotalsNumber'

export const progressColors = {
  default: `bg-ds-primary-green`,
  neutral: `bg-ds-gray-senary`,
  primary: `bg-ds-primary-green`,
  danger: `bg-ds-primary-red`,
  warning: `bg-ds-primary-yellow`,
} as const

export const progressVariants = {
  default: `h-1`,
  tall: `h-5`,
} as const

function Progress({
  amount,
  label,
  color = 'default',
  variant = 'default',
}: {
  amount: number
  label: boolean
  color?: keyof typeof progressColors
  variant?: keyof typeof progressVariants
}) {
  const amountInNumber = isNaN(amount) ? 0 : Number(amount)
  const totalsProps = variant === 'tall' ? { light: true } : {}

  return (
    <div className="flex flex-1 items-center gap-4">
      <div
        className={cs('flex-1 bg-ds-gray-secondary', progressVariants[variant])}
      >
        <div
          data-testid="org-progress-bar"
          className={cs('h-full', progressColors[color])}
          style={{ width: `${amountInNumber}%` }}
        />
      </div>

      {label && (
        <div className="flex-[0_0_56px]">
          <TotalsNumber
            data-testid="coverage-value"
            value={amount}
            plain
            {...totalsProps}
          />
        </div>
      )}
    </div>
  )
}

export default Progress
