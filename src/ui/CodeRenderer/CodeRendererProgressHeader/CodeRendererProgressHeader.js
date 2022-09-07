import isFinite from 'lodash/isFinite'
import PropTypes from 'prop-types'

import A from 'ui/A'
import CopyClipboard from 'ui/CopyClipboard'
import Progress from 'ui/Progress'
import TotalsNumber from 'ui/TotalsNumber'

function CodeRendererProgressHeader({ path, pathRef, fileCoverage, change }) {
  /**
   * Header component that shows progress bar for the Code Renderer component.
   * @param {[String]} treePaths path of file from root directory. Only used in standalone file viewer
   * @param {Float} fileCoverage total coverage of current file
   * @param {Float} change difference between head and base coverage. Only used in commmit based file viewer
   */

  return (
    <div
      className={`
      flex flex-row flex-wrap items-start justify-between gap-2 sm:items-center
      bg-ds-gray-primary
      border-t p-3 border-r border-l border-solid border-ds-gray-tertiary
    `}
    >
      <div className="flex flex-1 gap-1">
        {/* TODO: remove after coverage tab full release */}
        <A href={`#${path}`} hook="file-viewer" variant="greyOctinary">
          {path}
        </A>
        {path && (
          <CopyClipboard string={path} showLabel={false} variant="muted" />
        )}
      </div>
      <div className="max-w-xs sm:flex-1 flex gap-2 justify-end items-center">
        <Progress amount={fileCoverage} label />
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
