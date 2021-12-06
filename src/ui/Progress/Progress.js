import PropTypes from 'prop-types'

const variantClasses = {
  default: `bg-ds-primary-green`,
  progressNeutral: `bg-ds-gray-senary`,
  progressDanger: `bg-ds-primary-red`,
}

function Progress({ amount, label, variant = 'default' }) {
  const amountInNumber = isNaN(amount) ? 0 : amount
  const classNames = variantClasses[variant]

  return (
    <div className="w-full items-center flex">
      <div className="w-full bg-ds-gray-secondary mr-4 h-2.5">
        <div
          data-testid="org-progress-bar"
          className={`${classNames} h-2.5`}
          style={{ width: `${amountInNumber}%` }}
        />
      </div>
      {label && (
        <span className="font-semibold">{amountInNumber.toFixed(2)}%</span>
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
