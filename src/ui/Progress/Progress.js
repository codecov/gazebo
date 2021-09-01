import PropTypes from 'prop-types'

function Progress({ amount, label }) {
  return (
    <div className="w-full items-center flex">
      <div className="w-full bg-ds-gray-secondary mr-4 h-2.5">
        <div
          data-testid="org-progress-bar"
          className="h-2.5 bg-ds-primary-green"
          style={{ width: `${amount ?? 0}%` }}
        />
      </div>
      {label && (
        <span className="font-semibold">{amount?.toFixed(2) ?? 0}%</span>
      )}
    </div>
  )
}

Progress.propTypes = {
  amount: PropTypes.number.isRequired,
  label: PropTypes.bool,
}

export default Progress
