import PropTypes from 'prop-types'

import TotalsNumber from '../TotalsNumber'

const variantClasses = {
  default: `bg-ds-primary-green`,
  progressNeutral: `bg-ds-gray-senary`,
  progressDanger: `bg-ds-primary-red`,
}

function Progress({ amount, label, variant = 'default', isCoverage }) {
  const amountInNumber = isNaN(amount) ? 0 : amount
  const className = variantClasses[variant]

  return (
    <div className="w-full items-center flex">
      <div className="w-full bg-ds-gray-secondary mr-4 h-2.5">
        <div
          data-testid="org-progress-bar"
          className={`${className} h-2.5`}
          style={{ width: `${amountInNumber}%` }}
        />
      </div>
      {label && (
        <TotalsNumber
          data-testid="coverage-value"
          value={amountInNumber}
          plain
          inline
          allowZero={isCoverage}
        />
      )}
    </div>
  )
}

Progress.propTypes = {
  amount: PropTypes.number,
  label: PropTypes.bool,
  isCoverage: PropTypes.bool,
  variant: PropTypes.string,
}

export default Progress
