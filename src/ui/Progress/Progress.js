import PropTypes from 'prop-types'

function Progress({ amount, label }) {
  const amountInNumber = isNaN(amount) ? 0 : amount
  return (
    <div className="w-full items-center flex">
      <div className="w-full bg-ds-gray-secondary mr-4 h-2.5">
        <div
          data-testid="org-progress-bar"
          className="bg-ds-primary-green h-2.5"
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
}

export default Progress
