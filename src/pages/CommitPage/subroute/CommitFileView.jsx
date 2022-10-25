import PropTypes from 'prop-types'
import { useState } from 'react'
import { useParams } from 'react-router-dom'

import { useCommitBasedCoverageForFileViewer } from 'services/file'
import { CODE_RENDERER_TYPE } from 'shared/utils/fileviewer'
import { getFilenameFromFilePath } from 'shared/utils/url'
import CodeRenderer from 'ui/CodeRenderer'
import CodeRendererInfoRow from 'ui/CodeRenderer/CodeRendererInfoRow'
import SingleLine from 'ui/CodeRenderer/SingleLine'
import { TitleFlags } from 'ui/FileViewer/ToggleHeader/Title'

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

function CommitFileView({ diff, path }) {
  const { owner, repo, provider, commit } = useParams()
  const fileName = getFilenameFromFilePath(path)
  const [selectedFlags, setSelectedFlags] = useState([])

  const {
    isLoading: coverageIsLoading,
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

  return (
    <div className="flex flex-col">
      {flagNames && flagNames?.length > 1 && (
        <CodeRendererInfoRow>
          <div className="flex justify-end w-full">
            <TitleFlags
              flags={flagNames}
              onFlagsChange={setSelectedFlags}
              flagsIsLoading={coverageIsLoading}
            />
          </div>
        </CodeRendererInfoRow>
      )}
      {content ? (
        <CodeRenderer
          code={content}
          fileName={fileName}
          rendererType={CODE_RENDERER_TYPE.SINGLE_LINE}
          LineComponent={({ i, line, getLineProps, getTokenProps }) => (
            <SingleLine
              key={i + 1}
              line={line}
              number={i + 1}
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
  path: PropTypes.string,
}

export default CommitFileView
