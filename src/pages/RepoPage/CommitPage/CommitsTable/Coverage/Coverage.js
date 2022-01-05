import Progress from 'ui/Progress'
import PropTypes from 'prop-types'

const Coverage = ({ totals }) => {
  return (
    <div className="w-full justify-end flex">
      {typeof totals?.coverage === 'number' ? (
        <span className="w-64">
          <Progress amount={totals?.coverage} label={true} />
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
