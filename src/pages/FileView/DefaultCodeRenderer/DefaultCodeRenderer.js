import PropType from 'prop-types'
import { useState } from 'react'
import { useParams } from 'react-router-dom'

import NotFound from 'pages/NotFound'
import { useCommitBasedCoverageForFileViewer } from 'services/file'
import { useOwner } from 'services/user'
import { CODE_RENDERER_TYPE } from 'shared/utils/fileviewer'
import { getFilenameFromFilePath } from 'shared/utils/url'
import CodeRenderer from 'ui/CodeRenderer'
import CodeRendererProgressHeader from 'ui/CodeRenderer/CodeRendererProgressHeader'
import SingleLine from 'ui/CodeRenderer/SingleLine'
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
// TODO: probably move this to some sort of context; think of a solution with useReducer
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

function DefaultCodeRenderer({ title }) {
  const { owner, repo, provider, ref, path } = useParams()
  const { data: ownerData } = useOwner({ username: owner })
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
    path,
    selectedFlags,
  })

  const flagData = {
    flagNames,
    selectedFlags,
    setSelectedFlags,
  }
  // *********** This is temporary code that will be here in the meantime *********** //
  if (!ownerData) {
    return <NotFound />
  }

  return (
    <div className="border-t border-solid border-ds-gray-tertiary pt-6 flex flex-col gap-2">
      <ToggleHeader
        title={title}
        flagData={flagData}
        coverageIsLoading={coverageIsLoading}
        lineCoverageStatesAndSetters={lineCoverageStatesAndSetters}
      />
      <div>
        <CodeRendererProgressHeader
          path={path} // This is only populated in standalone fileviewer
          pathRef={ref} // This is only populated in standalone fileviewer
          fileCoverage={fileCoverage}
        />
        {content ? (
          <CodeRenderer
            code={content}
            fileName={getFilenameFromFilePath(path)}
            rendererType={CODE_RENDERER_TYPE.SINGLE_LINE}
            LineComponent={({ i, line, getLineProps, getTokenProps }) => (
              <SingleLine
                key={i}
                line={line}
                number={i + 1}
                showLines={{
                  showCovered: covered,
                  showPartial: partial,
                  showUncovered: uncovered,
                }}
                getLineProps={getLineProps}
                getTokenProps={getTokenProps}
                coverage={coverageData && coverageData[i + 1]}
              />
            )}
          />
        ) : (
          <ErrorDisplayMessage />
        )}
      </div>
    </div>
  )
}

DefaultCodeRenderer.propTypes = {
  title: PropType.string,
}

export default DefaultCodeRenderer
