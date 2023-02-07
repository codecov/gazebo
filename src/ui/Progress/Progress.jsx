import cs from 'classnames'
import PropTypes from 'prop-types'

import TotalsNumber from '../TotalsNumber'

const progressClasses = Object.freeze({
  default: `bg-ds-primary-green`,
  neutral: `bg-ds-gray-senary`,
  primary: `bg-ds-primary-green`,
  danger: `bg-ds-primary-red`,
  warning: `bg-ds-primary-yellow`,
})

const variantClasses = Object.freeze({
  default: `h-1`,
  tall: `h-5`,
})

function Progress({ amount, label, color = 'default', variant = 'default' }) {
  const amountInNumber = isNaN(amount) ? 0 : Number(amount)
  const totalsProps = variant === 'tall' ? { light: true } : {}

  return (
    <div className="flex-1 flex items-center gap-4">
      <div
        className={cs('flex-1 bg-ds-gray-secondary', variantClasses[variant])}
      >
        <div
          data-testid="org-progress-bar"
          className={cs('h-full', progressClasses[color])}
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

Progress.propTypes = {
  amount: PropTypes.number,
  label: PropTypes.bool,
  variant: PropTypes.oneOf(['default', 'tall']),
  color: PropTypes.oneOf([
    'default',
    'neutral',
    'primary',
    'danger',
    'warning',
  ]),
}

export default Progress
