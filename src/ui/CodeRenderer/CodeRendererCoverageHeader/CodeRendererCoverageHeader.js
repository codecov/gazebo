import isFinite from 'lodash/isFinite'
import PropTypes from 'prop-types'

import CopyClipboard from 'ui/CopyClipboard'
import TotalsNumber from 'ui/TotalsNumber'

function CodeRendererCoverageHeader({
  header,
  headName,
  headCoverage,
  patchCoverage,
  changeCoverage,
}) {
  /**
   * Header component that shows coverage values for the Code Renderer component.
   * @param {String} header changes per author's diff
   * @param {String} headName title of the segment
   * @param {Float} headCoverage coverage belonging to the head of the segment
   * @param {Float} patchCoverage patch belonging to the file of the segment
   * @param {Float} changeCoverage change belonging to the file of the segment
   */

  return (
    <div
      className={`
        flex flex-row flex-wrap items-start justify-between gap-2 sm:items-center
        bg-ds-gray-primary
        border-t p-3 border-r border-l border-solid border-ds-gray-tertiary
      `}
    >
      <div className="flex gap-2 text-ds-gray-quinary items-center">
        <span>{header}</span>
        <span className="font-semibold">{headName}</span>
        {/* TODO: adjust this copyclipboard component have a gray variant*/}
        {/* TODO: Figure out where this clipboard is going to! */}
        <CopyClipboard string={headName} />
      </div>
      {/* TODO: we need to change how we deal with 0 with the totals number */}
      <div className="max-w-xs sm:flex-1 flex gap-2 justify-end items-center">
        {isFinite(headCoverage) && (
          <>
            <span className="font-semibold text-ds-gray-quinary">HEAD</span>{' '}
            <TotalsNumber value={headCoverage} plain light />
          </>
        )}
        {isFinite(patchCoverage) && (
          <>
            <span className="font-semibold text-ds-gray-quinary">Patch</span>{' '}
            <TotalsNumber value={patchCoverage} plain light />
          </>
        )}
        {isFinite(changeCoverage) && (
          <>
            <span className="font-semibold text-ds-gray-quinary">Change</span>{' '}
            <TotalsNumber value={changeCoverage} showChange light />
          </>
        )}
      </div>
    </div>
  )
}

CodeRendererCoverageHeader.propTypes = {
  header: PropTypes.string,
  headName: PropTypes.string,
  headCoverage: PropTypes.number,
  patchCoverage: PropTypes.number,
  changeCoverage: PropTypes.number,
}

export default CodeRendererCoverageHeader
