import PropTypes from 'prop-types'

function Progress({ amount, label }) {
  const amountInNumber = isNaN(amount) ? 0 : amount
  return (
    <>
      <div
        data-testid="org-progress-bar"
        className="bg-ds-primary-green sm:max-w-xs"
        style={{ width: `${amountInNumber}%` }}
      />
      {label && (
        <span className="font-semibold">{amountInNumber.toFixed(2)}%</span>
      )}
    </>
  )
}

Progress.propTypes = {
  amount: PropTypes.number,
  label: PropTypes.bool,
}

export default Progress
