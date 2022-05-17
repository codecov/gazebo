import isFinite from 'lodash/isFinite'
import PropTypes from 'prop-types'

import CopyClipboard from 'ui/CopyClipboard'
import TotalsNumber from 'ui/TotalsNumber'

// Cleanup / Complexity to support file lables.
const FlagControl = ({ headCoverage, patchCoverage, changeCoverage }) => (
  <>
    {isFinite(headCoverage) && (
      <Checkvalue value={headCoverage} title={'HEAD'} />
    )}
    {isFinite(patchCoverage) && (
      <Checkvalue value={patchCoverage} title={'Patch'} />
    )}
    {isFinite(changeCoverage) && (
      <Checkvalue value={changeCoverage} title={'Change'} />
    )}
  </>
)

FlagControl.propTypes = {
  headCoverage: PropTypes.number,
  patchCoverage: PropTypes.number,
  changeCoverage: PropTypes.number,
}

const Checkvalue = ({ value, title }) => (
  <>
    <span className="font-semibold text-ds-gray-quinary">{title}</span>{' '}
    <TotalsNumber value={value} plain light />
  </>
)

Checkvalue.propTypes = {
  value: PropTypes.number,
  title: PropTypes.string,
}

function CodeRendererCoverageHeader({
  header,
  headName,
  headCoverage,
  patchCoverage,
  changeCoverage,
  isNewFile = false,
  isRenamed = false,
}) {
  /**
   * Header component that shows coverage values for the Code Renderer component.
   * @param {String} header changes per author's diff
   * @param {String} headName title of the segment
   * @param {Float} headCoverage coverage belonging to the head of the segment
   * @param {Float} patchCoverage patch belonging to the file of the segment
   * @param {Float} changeCoverage change belonging to the file of the segment
   * @param {Bool} isNewFile boolean that says if this is a new file
   * @param {Bool} isRenamed boolean that says if this is a renamed file
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
        {headName && <CopyClipboard string={headName} />}
      </div>
      {/* TODO: design ask on how to display new, renamed or deleted? file */}
      <div className="max-w-xs sm:flex-1 flex gap-2 justify-end items-center">
        <FlagControl
          headCoverage={headCoverage}
          patchCoverage={patchCoverage}
          changeCoverage={changeCoverage}
        />
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
  // This seems too specific should it be more render props?
  isNewFile: PropTypes.bool,
  isRenamed: PropTypes.bool,
}

export default CodeRendererCoverageHeader
