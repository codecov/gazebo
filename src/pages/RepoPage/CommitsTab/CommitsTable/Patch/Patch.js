import { isNumber } from 'lodash'
import PropTypes from 'prop-types'

function Patch({ compareWithParent }) {
  // This should come multiplied by 100 from the DB
  const patch = compareWithParent?.patchTotals?.coverage

  return (
    <div data-testid="patch-value" className="flex justify-end w-full font-semibold">
      {patch && isNumber(patch) && patch !== 0 ? (
        <span className='bg-green-100'>
          {100*patch.toFixed(2)}%
        </span>
      ) : (
        <span>
          -
        </span>
      )}
    </div>
  )
}

Patch.propTypes = {
  compareWithParent: PropTypes.shape({
    patchTotals: PropTypes.shape({
      coverage: PropTypes.number,
    }),
  }),
}

export default Patch
