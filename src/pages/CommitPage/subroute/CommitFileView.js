/*eslint max-statements: [2, 1, {ignoreTopLevelFunctions: true}]*/ // M
import PropTypes from 'prop-types'
import { useState } from 'react'
import { useParams } from 'react-router-dom'

import { useCoverageData, useFileWithMainCoverage } from 'services/file/hooks'
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
  const { owner, repo, provider, commit, path } = useParams()
  const { data } = useFileWithMainCoverage({
    provider,
    owner,
    repo,
    ref: commit,
    path: path,
  })

  // TODO: probably move this to some sort of context
  const [selectedFlags, setSelectedFlags] = useState([])
  const [covered, setCovered] = useState(true)
  const [uncovered, setUncovered] = useState(true)
  const [partial, setPartial] = useState(true)

  // TODO: fix this use of double hook (you don't need useFileWithMainCoverage and useCoverageData)
  const {
    isLoading: coverageIsLoading,
    totals: fileCoverage,
    coverage: coverageData,
  } = useCoverageData({
    coverage: data?.coverage,
    totals: data?.totals,
    selectedFlags,
  })

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
    flagNames: data?.flagNames,
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
        {data?.content ? (
          <CodeRenderer
            showCovered={covered}
            showUncovered={uncovered}
            coverage={coverageData}
            showPartial={partial}
            code={data?.content}
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
