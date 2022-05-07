import dropRight from 'lodash/dropRight'
import indexOf from 'lodash/indexOf'
import { useState } from 'react'
import { useParams } from 'react-router-dom'

import NotFound from 'pages/NotFound'
import { useCommitBasedCoverageForFileViewer } from 'services/file/hooks'
import { useOwner } from 'services/user'
import Breadcrumb from 'ui/Breadcrumb'
import CodeRenderer from 'ui/CodeRenderer'
import ProgressHeader from 'ui/CodeRenderer/ProgressHeader'
import ToggleHeader from 'ui/FileViewer/ToggleHeader'

function ErrorDisplayMessage() {
  return (
    <div className="border-solid border-ds-gray-tertiary border p-4">
      <p>
        There was a problem getting the source code from your provider. Unable
        to show line by line coverage.
      </p>
    </div>
  )
}

function getTreeLocation(paths, location) {
  return dropRight(paths, paths.length - indexOf(paths, location) - 1).join('/')
}

// This function solely done to eliminate max-statements complexity
// TODO: probably move this to some sort of context
function useCoverageAndFlagsStates() {
  const [selectedFlags, setSelectedFlags] = useState([])
  const [covered, setCovered] = useState(true)
  const [uncovered, setUncovered] = useState(true)
  const [partial, setPartial] = useState(true)

  return {
    partial,
    covered,
    uncovered,
    lineCoverageStatesAndSetters: {
      covered,
      setCovered,
      uncovered,
      setUncovered,
      partial,
      setPartial,
    },
    flagsState: { selectedFlags, setSelectedFlags },
  }
}

function FileView() {
  const { owner, repo, provider, ref, ...path } = useParams()
  const { data: ownerData } = useOwner({ username: owner })
  const paths = path[0].split('/')

  // *********** This is temporary code that will be here in the meantime *********** //
  const {
    partial,
    covered,
    uncovered,
    lineCoverageStatesAndSetters,
    flagsState: { selectedFlags, setSelectedFlags },
  } = useCoverageAndFlagsStates()

  // TODO: This hook needs revision/enhancement
  const {
    content,
    flagNames,
    totals: fileCoverage,
    coverage: coverageData,
    isLoading: coverageIsLoading,
  } = useCommitBasedCoverageForFileViewer({
    owner,
    repo,
    provider,
    commit: ref,
    path: path[0],
    selectedFlags,
  })

  const flagData = {
    flagNames,
    selectedFlags,
    setSelectedFlags,
  }
  // *********** This is temporary code that will be here in the meantime *********** //

  const treePaths = paths.map((location) => ({
    pageName: 'treeView',
    text: location,
    options: { tree: getTreeLocation(paths, location), ref: ref },
  }))

  if (!ownerData) {
    return <NotFound />
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="px-3 sm:px-0">
        <Breadcrumb
          paths={[
            { pageName: 'owner', text: owner },
            { pageName: 'repo', text: repo },
            { pageName: '', readOnly: true, text: ref },
          ]}
        />
      </div>
      <div className="border-t border-solid border-ds-gray-tertiary pt-6">
        <ToggleHeader
          title={'File Viewer'}
          flagData={flagData}
          coverageIsLoading={coverageIsLoading}
          lineCoverageStatesAndSetters={lineCoverageStatesAndSetters}
        />
        <ProgressHeader
          treePaths={treePaths} // This is only populated in standalone fileviewer
          fileCoverage={fileCoverage}
        />
        {content ? (
          <CodeRenderer
            showCovered={covered}
            showUncovered={uncovered}
            coverage={coverageData}
            showPartial={partial}
            code={content}
            fileName={paths.slice(-1)[0]}
          />
        ) : (
          <ErrorDisplayMessage />
        )}
      </div>
    </div>
  )
}

export default FileView
