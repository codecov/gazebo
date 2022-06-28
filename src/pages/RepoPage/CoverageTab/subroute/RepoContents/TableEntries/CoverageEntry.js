import PropTypes from 'prop-types'

import Progress from 'ui/Progress'

function CoverageEntry({ percentCovered }) {
  return (
    <div className="flex flex-1 gap-2 items-center">
      <Progress amount={percentCovered} label />
    </div>
  )
}

CoverageEntry.propTypes = {
  percentCovered: PropTypes.number.isRequired,
}

export default CoverageEntry
