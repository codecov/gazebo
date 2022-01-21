import PropTypes from 'prop-types'

const Change = ({ totals, parent }) => {
  if (!totals?.coverage) return ''

  const coverage = totals?.coverage.toFixed(2)
  const parentCoverage = parent?.totals?.coverage.toFixed(2)
  const change = (coverage - parentCoverage).toFixed(2)

  return (
    !isNaN(change) && (
      <div className="flex justify-end w-full font-semibold">
        <span className={change < 0 ? 'bg-red-100' : 'bg-green-100'}>
          {change}%
        </span>
      </div>
    )
  )
}

Change.propTypes = {
  totals: PropTypes.shape({
    coverage: PropTypes.number,
  }),
  parent: PropTypes.shape({
    totals: PropTypes.shape({
      coverage: PropTypes.number,
    }),
  }),
}

export default Change
