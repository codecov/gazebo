import isFinite from 'lodash/isFinite'
import PropTypes from 'prop-types'

import { unsupportedExtensionsMapper } from 'shared/utils/unsupportedExtensionsMapper'
import A from 'ui/A'
import { CopyClipboard } from 'ui/CopyClipboard'
import Progress from 'ui/Progress'
import TotalsNumber from 'ui/TotalsNumber'

function CodeRendererProgressHeader({ path, fileCoverage, change }) {
  /**
   * Header component that shows progress bar for the Code Renderer component.
   * @param {[String]} treePaths path of file from root directory. Only used in standalone file viewer
   * @param {Float} fileCoverage total coverage of current file
   * @param {Float} change difference between head and base coverage. Only used in commit based file viewer
   */

  const isUnsupportedFileType = unsupportedExtensionsMapper({ path })

  return (
    <div
      className={`
      flex flex-row flex-wrap items-start justify-between gap-2 border-x
      border-t
      border-solid border-ds-gray-tertiary bg-ds-gray-primary p-3 sm:items-center
    `}
    >
      <div className="flex flex-1 gap-1">
        {/* TODO: remove after coverage tab full release */}
        <A href={`#${path}`} hook="file-viewer" variant="greyOctinary">
          {path}
        </A>
        {path ? <CopyClipboard value={path} /> : null}
      </div>
      <div className="flex max-w-xs items-center justify-end gap-2 sm:flex-1">
        {!isUnsupportedFileType && <Progress amount={fileCoverage} label />}
        {isFinite(change) && <TotalsNumber value={change} showChange />}
      </div>
    </div>
  )
}

CodeRendererProgressHeader.propTypes = {
  change: PropTypes.number,
  fileCoverage: PropTypes.number,
  pathRef: PropTypes.string,
  path: PropTypes.string,
}

export default CodeRendererProgressHeader
