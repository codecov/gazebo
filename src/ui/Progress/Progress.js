import cs from 'classnames'
import PropTypes from 'prop-types'

import TotalsNumber from '../TotalsNumber'

const variantClasses = {
  default: `bg-ds-primary-green`,
  progressNeutral: `bg-ds-gray-senary`,
  progressDanger: `bg-ds-primary-red`,
}

function Progress({ amount, label, variant = 'default' }) {
  const amountInNumber = isNaN(amount) ? 0 : Number(amount)
  const className = variantClasses[variant]

  return (
    <div className="w-full items-center flex">
      {amountInNumber ? (
        <div className="w-full bg-ds-gray-secondary mr-4 h-2.5">
          <div
            data-testid="org-progress-bar"
            className={`${className} h-2.5`}
            style={{ width: `${amountInNumber}%` }}
          />
        </div>
      ) : (
        ''
      )}

      {label && (
        <div
          className={cs({
            'w-full flex justify-end': !amountInNumber,
          })}
        >
          <TotalsNumber data-testid="coverage-value" value={amount} plain />
        </div>
      )}
    </div>
  )
}

Progress.propTypes = {
  amount: PropTypes.number,
  label: PropTypes.bool,
  variant: PropTypes.string,
}

export default Progress
