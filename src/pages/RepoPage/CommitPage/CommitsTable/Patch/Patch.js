import { isNumber } from 'lodash'
import PropTypes from 'prop-types'

function Patch({ commit }) {
  const rawPatch = commit?.compareWithParent?.patchTotals?.coverage
  const patch = isNumber(rawPatch) && `${(rawPatch * 100).toFixed(2)}%` //are we sure?

  return (
    patch && (
      <div className="flex justify-end w-full font-semibold">{patch}</div>
    )
  )
}

Patch.propTypes = {
  commit: PropTypes.shape({
    author: PropTypes.shape({
      username: PropTypes.string,
    }),
    compareWithParent: PropTypes.shape({
      patchTotals: PropTypes.shape({
        coverage: PropTypes.number,
      }),
    }),
    totals: PropTypes.shape({
      coverage: PropTypes.number,
    }),
    commitid: PropTypes.string,
    message: PropTypes.string,
    createdAt: PropTypes.string,
  }),
}

export default Patch
