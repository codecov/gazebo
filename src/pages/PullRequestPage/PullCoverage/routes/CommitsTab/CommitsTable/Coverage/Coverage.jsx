import PropTypes from 'prop-types'

import TotalsNumber from 'ui/TotalsNumber'

const Coverage = ({ totals }) => {
  return (
    <div className="flex w-full justify-end">
      {typeof totals?.coverage === 'number' ? (
        <TotalsNumber value={totals?.coverage} plain />
      ) : (
        <span className="text-sm text-ds-gray-quinary">
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
