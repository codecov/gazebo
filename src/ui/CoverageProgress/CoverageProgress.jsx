import PropTypes from 'prop-types'

import Progress from 'ui/Progress'

const CoverageProgress = ({ color, coverage, variant = 'default' }) => {
  if (typeof coverage === 'number') {
    return <Progress amount={coverage} color={color} variant={variant} label />
  }

  return <p className="text-ds-gray-quinary text-sm">No report uploaded yet</p>
}

CoverageProgress.propTypes = {
  coverage: PropTypes.number,
  variant: PropTypes.oneOf(['default', 'tall']),
  color: PropTypes.oneOf(['default', 'danger', 'warning']),
}

export default CoverageProgress
