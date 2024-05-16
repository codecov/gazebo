import PropTypes from 'prop-types'

import { CopyClipboard } from 'ui/CopyClipboard'
import Label from 'ui/Label'

import Coverage from './Coverage'

function CodeRendererCoverageHeader({ header, headName, coverage, fileLabel }) {
  /**
   * Header component that shows coverage values for the Code Renderer component.
   * @param {String} header changes per author's diff
   * @param {String} headName title of the segment
   * @param {Array} coverage Key Value pairs of coverage and the label
   * @param {String} fileLabel a label for the whole file such as "New"
   * @return {JSX} Renders the file path, patch, and coverage totals for the file.
   */

  return (
    <div
      className={`
        flex flex-row flex-wrap items-center justify-between gap-2 border
        border-solid
        border-ds-gray-tertiary bg-ds-gray-primary p-3 sm:items-center
      `}
    >
      <div className="flex items-center gap-1 text-ds-gray-quinary">
        <span>{header}</span>
        <span className="font-semibold">{headName}</span>
        {headName && <CopyClipboard value={headName} variant="muted" />}
        {fileLabel && <Label variant="subtle">{fileLabel}</Label>}
      </div>
      <Coverage coverageData={coverage} />
    </div>
  )
}

CodeRendererCoverageHeader.propTypes = {
  header: PropTypes.string,
  headName: PropTypes.string,
  coverage: PropTypes.arrayOf(
    PropTypes.shape({ value: PropTypes.number, label: PropTypes.string })
  ),
  fileLabel: PropTypes.string,
}

export default CodeRendererCoverageHeader
