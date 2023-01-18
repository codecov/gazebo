import PropTypes from 'prop-types'

import Progress from 'ui/Progress'

const CoverageProgress = ({ color, totals }) => {
  if (typeof totals?.coverage === 'number') {
    return (
      <span className="w-64">
        <Progress amount={totals?.coverage} label color={color} />
      </span>
    )
  }

  return (
    <span className="text-ds-gray-quinary text-sm">No report uploaded yet</span>
  )
}

CoverageProgress.propTypes = {
  totals: PropTypes.shape({
    coverage: PropTypes.number,
  }),
  color: PropTypes.oneOf(['default', 'danger', 'warning']),
}

export default CoverageProgress
