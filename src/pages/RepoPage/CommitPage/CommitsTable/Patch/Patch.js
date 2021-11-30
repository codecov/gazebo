import { isNumber } from 'lodash'
import PropTypes from 'prop-types'
import { CommitRequestType } from '../../types'

function Patch({ commit }) {
  const rawPatch = commit?.compareWithParent?.patchTotals?.coverage
  const patch = isNumber(rawPatch) && `${rawPatch}%`

  return (
    patch && (
      <div className="flex justify-end w-full font-semibold">{patch}</div>
    )
  )
}

Patch.propTypes = {
  commit: PropTypes.shape(CommitRequestType),
}

export default Patch
