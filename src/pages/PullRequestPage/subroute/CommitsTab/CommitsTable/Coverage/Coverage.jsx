import PropTypes from 'prop-types'

import TotalsNumber from 'ui/TotalsNumber'

const Coverage = ({ totals }) => {
  return (
    <div className="w-full justify-end flex">
      {typeof totals?.coverage === 'number' ? (
        <TotalsNumber value={totals?.coverage} plain />
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
