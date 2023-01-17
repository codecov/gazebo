import PropTypes from 'prop-types'

import Progress from 'ui/Progress'

function CoverageEntry({ percentCovered }) {
  return <Progress amount={percentCovered} label />
}

CoverageEntry.propTypes = {
  percentCovered: PropTypes.number.isRequired,
}

export default CoverageEntry
