import PropTypes from 'prop-types'

import Progress from 'ui/Progress'

const CoverageProgress = ({ color, amount, variant = 'default' }) => {
  if (typeof amount === 'number') {
    return <Progress amount={amount} color={color} variant={variant} label />
  }

  return <p className="text-ds-gray-quinary text-sm">No report uploaded yet</p>
}

CoverageProgress.propTypes = {
  amount: PropTypes.number,
  variant: PropTypes.oneOf(['default', 'tall']),
  color: PropTypes.oneOf(['primary', 'danger', 'warning']),
}

export default CoverageProgress
