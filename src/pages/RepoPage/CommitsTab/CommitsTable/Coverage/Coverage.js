import PropTypes from 'prop-types'

import Progress from 'ui/Progress'

const Coverage = ({ totals }) => {
  return (
    <div className="w-full justify-end flex">
      {typeof totals?.coverage === 'number' ? (
        <span className="w-64">
          <Progress amount={totals?.coverage} label isCoverage />
        </span>
      ) : (
        <span className="text-ds-gray-quinary text-sm">
          No report uploaded yet
        </span>
      )}
    </div>
  )
}

Coverage.propTypes = {
  totals: PropTypes.shape({
    coverage: PropTypes.number,
  }),
  commitid: PropTypes.string,
}

export default Coverage
