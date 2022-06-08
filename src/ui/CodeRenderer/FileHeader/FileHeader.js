import PropTypes from 'prop-types'

import CopyClipboard from 'ui/CopyClipboard'
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
        flex flex-row flex-wrap items-center justify-between gap-2 sm:items-center
        bg-ds-gray-primary
        border-t p-3 border-r border-l border-b border-solid border-ds-gray-tertiary
      `}
    >
      <div className="flex gap-1 text-ds-gray-quinary items-center">
        <span>{header}</span>
        <span className="font-semibold">{headName}</span>
        {headName && (
          <CopyClipboard string={headName} showLabel={false} variant="muted" />
        )}
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
