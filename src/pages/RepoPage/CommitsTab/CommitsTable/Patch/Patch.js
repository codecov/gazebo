import { isNumber } from 'lodash'
import PropTypes from 'prop-types'

function Patch({ compareWithParent }) {
  const rawPatch = compareWithParent?.patchTotals?.coverage
  const patch = isNumber(rawPatch) && `${rawPatch}%`

  return (
    patch && (
      <div className="flex justify-end w-full font-semibold">{patch}</div>
    )
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
