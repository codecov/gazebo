import PropTypes from 'prop-types'

const Change = ({ commit }) => {
  if (!commit?.totals?.coverage) return ''

  const coverage = commit?.totals?.coverage.toFixed(2)
  const parentCoverage = commit?.parent?.totals?.coverage.toFixed(2)
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
  commit: PropTypes.shape({
    author: PropTypes.shape({
      username: PropTypes.string,
    }),
    compareWithParent: PropTypes.shape({
      patchTotals: PropTypes.shape({
        coverage: PropTypes.number,
      }),
    }),
    totals: PropTypes.shape({
      coverage: PropTypes.number,
    }),
    parent: PropTypes.shape({
      totals: PropTypes.shape({
        coverage: PropTypes.number,
      }),
    }),
    commitid: PropTypes.string,
    message: PropTypes.string,
    createdAt: PropTypes.string,
  }),
}

export default Change
