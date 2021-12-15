import { isNumber } from 'lodash'

import { commitRequestType } from 'shared/propTypes'

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
  commit: commitRequestType,
}

export default Patch
