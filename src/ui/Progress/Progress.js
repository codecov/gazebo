import cs from 'classnames'
import PropTypes from 'prop-types'

import TotalsNumber from '../TotalsNumber'

const progressClasses = {
  default: `bg-ds-primary-green`,
  neutral: `bg-ds-gray-senary`,
  danger: `bg-ds-primary-red`,
}

const variantClasses = {
  default: `h-2.5`,
  tall: `h-5`,
}

function Progress({ amount, label, color = 'default', variant = 'default' }) {
  const amountInNumber = isNaN(amount) ? 0 : Number(amount)
  const totalsProps = variant === 'tall' ? { light: true } : {}

  return (
    <div className="w-full items-center flex gap-4">
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
        <div
          className={cs({
            'flex-none flex justify-end': !amountInNumber,
          })}
        >
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
  color: PropTypes.oneOf(['default', 'neutral', 'danger']),
}

export default Progress
