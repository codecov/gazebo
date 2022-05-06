import PropTypes from 'prop-types'
import { useState } from 'react'
import { useParams } from 'react-router-dom'

import { useCommitBasedCoverageForFileViewer } from 'services/file/hooks'
import Breadcrumb from 'ui/Breadcrumb'
import CodeRenderer from 'ui/CodeRenderer'
import CodeRendererProgressHeader from 'ui/CodeRendererProgressHeader'
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

function CommitFileView({ diff }) {
  const { owner, repo, provider, commit, path } = useParams()
  const change = diff?.headCoverage?.coverage - diff?.baseCoverage?.coverage

  // *********** This is temporary code that will be here in the meantime *********** //
  const {
    partial,
    covered,
    uncovered,
    lineCoverageStatesAndSetters,
    flagsState: { selectedFlags, setSelectedFlags },
  } = useCoverageAndFlagsStates()

  const {
    isLoading: coverageIsLoading,
    totals: fileCoverage,
    coverage: coverageData,
    flagNames,
    content,
  } = useCommitBasedCoverageForFileViewer({
    owner,
    repo,
    provider,
    commit,
    path,
    selectedFlags,
  })

  const flagData = {
    flagNames,
    selectedFlags,
    setSelectedFlags,
  }
  // *********** This is temporary code that will be here in the meantime *********** //

  const title = (
    <Breadcrumb
      paths={[
        {
          pageName: 'commit',
          text: 'Impacted files',
          options: { commit: commit },
        },
        { pageName: 'path', text: path.split('/').pop() },
      ]}
    />
  )

  return (
    <div className="flex flex-col gap-4">
      <ToggleHeader
        title={title}
        flagData={flagData}
        coverageIsLoading={coverageIsLoading}
        lineCoverageStatesAndSetters={lineCoverageStatesAndSetters}
      />
      <div>
        <CodeRendererProgressHeader
          treePaths={[]} // This is only populated in standalone fileviewer
          fileCoverage={fileCoverage}
          change={change}
        />
        {content ? (
          <CodeRenderer
            showCovered={covered}
            showUncovered={uncovered}
            coverage={coverageData}
            showPartial={partial}
            code={content}
            fileName={path}
          />
        ) : (
          <ErrorDisplayMessage />
        )}
      </div>
    </div>
  )
}

CommitFileView.propTypes = {
  diff: PropTypes.shape({
    baseCoverage: PropTypes.shape({
      coverage: PropTypes.number,
    }),
    headCoverage: PropTypes.shape({
      coverage: PropTypes.number,
    }),
  }),
}

export default CommitFileView
