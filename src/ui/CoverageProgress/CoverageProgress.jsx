import PropTypes from 'prop-types'

import Progress from 'ui/Progress'

const CoverageProgress = ({ color, totals }) => {
  if (typeof totals?.coverage === 'number') {
    return <Progress amount={totals?.coverage} label color={color} />
  }

  return <p className="text-ds-gray-quinary text-sm">No report uploaded yet</p>
}

CoverageProgress.propTypes = {
  totals: PropTypes.shape({
    coverage: PropTypes.number,
  }),
  color: PropTypes.oneOf(['default', 'danger', 'warning']),
}

export default CoverageProgress
