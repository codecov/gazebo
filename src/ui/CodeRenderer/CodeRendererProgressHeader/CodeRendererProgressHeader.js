import dropRight from 'lodash/dropRight'
import indexOf from 'lodash/indexOf'
import isFinite from 'lodash/isFinite'
import PropTypes from 'prop-types'

import Breadcrumb from 'ui/Breadcrumb'
import CopyClipboard from 'ui/CopyClipboard'
import Progress from 'ui/Progress'
import TotalsNumber from 'ui/TotalsNumber'

function getTreeLocation(paths, location) {
  return dropRight(paths, paths.length - indexOf(paths, location) - 1).join('/')
}

function CodeRendererProgressHeader({ pathParams, fileCoverage, change }) {
  /**
   * Header component that shows progress bar for the Code Renderer component.
   * @param {[String]} treePaths path of file from root directory. Only used in standalone file viewer
   * @param {Float} fileCoverage total coverage of current file
   * @param {Float} change difference between head and base coverage. Only used in commmit based file viewer
   */
  const paths = pathParams?.paths
  const ref = pathParams?.ref

  const treePaths =
    paths &&
    paths.map((location) => ({
      pageName: 'treeView',
      text: location,
      options: { tree: getTreeLocation(paths, location), ref: ref },
    }))

  return (
    <div
      className={`
      flex flex-row flex-wrap items-start justify-between gap-2 sm:items-center
      bg-ds-gray-primary
      border-t p-3 border-r border-l border-solid border-ds-gray-tertiary
    `}
    >
      <div className="flex flex-1 gap-1">
        <Breadcrumb paths={treePaths && [...treePaths]} />
        {paths && (
          <CopyClipboard
            string={paths.join('/')}
            showLabel={false}
            variant="muted"
          />
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
  pathParams: PropTypes.objectOf({
    paths: PropTypes.array,
    ref: PropTypes.string,
  }),
  change: PropTypes.number,
  fileCoverage: PropTypes.number,
}

export default CodeRendererProgressHeader
