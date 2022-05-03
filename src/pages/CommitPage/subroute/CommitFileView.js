import PropTypes from 'prop-types'
import { useState } from 'react'
import { useParams } from 'react-router-dom'

import { useCommitBasedCoverageForFileviewer } from 'services/file/hooks'
import CodeRenderer from 'shared/FileViewer/CodeRenderer'
import CodeRendererProgressHeader from 'ui/CodeRendererProgressHeader'
import FileviewerToggleHeader from 'ui/FileviewerToggleHeader'

const ErrorDisplayMessage = (
  <div className="border-solid border-ds-gray-tertiary border p-4">
    <p>
      There was a problem getting the source code from your provider. Unable to
      show line by line coverage.
    </p>
  </div>
)

function CommitFileView({ diff }) {
  const { path } = useParams()
  const [selectedFlags, setSelectedFlags] = useState([])
  // TODO: probably move this to some sort of context
  const [covered, setCovered] = useState(true)
  const [uncovered, setUncovered] = useState(true)
  const [partial, setPartial] = useState(true)

  const {
    isLoading: coverageIsLoading,
    totals: fileCoverage,
    coverage: coverageData,
    flagNames,
    content,
  } = useCommitBasedCoverageForFileviewer({ selectedFlags })

  const change = diff?.headCoverage?.coverage - diff?.baseCoverage?.coverage

  // *********** This is temporary code that will be here in the meantime *********** //
  const lineCoverageStatesAndSetters = {
    covered,
    setCovered,
    uncovered,
    setUncovered,
    partial,
    setPartial,
  }
  const flagData = {
    flagNames,
    selectedFlags,
    setSelectedFlags,
  }
  // *********** This is temporary code that will be here in the meantime *********** //

  return (
    <div className="flex flex-col gap-4">
      <FileviewerToggleHeader
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
