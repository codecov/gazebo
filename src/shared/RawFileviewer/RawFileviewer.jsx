import cs from 'classnames'
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
import CriticalFileLabel from 'ui/CodeRenderer/CriticalFileLabel'
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

// Note: This component is both used in the standalone fileviewer page and in the overview page. Changing this
// component will affect both places
function RawFileviewer({ title, showTopBorder = true, addTopPadding = true }) {
  const { owner, repo, provider, ref, path, commit } = useParams()
  const { data: ownerData } = useOwner({ username: owner })
  const [selectedFlags, setSelectedFlags] = useState([])

  // TODO: This hook needs revision/enhancement
  const {
    content,
    flagNames,
    totals: fileCoverage,
    coverage: coverageData,
    isLoading: coverageIsLoading,
    isCriticalFile,
  } = useCommitBasedCoverageForFileViewer({
    owner,
    repo,
    provider,
    commit: ref || commit,
    path,
    selectedFlags,
  })

  if (!ownerData) {
    return <NotFound />
  }

  return (
    <div
      className={cs('flex flex-col gap-2', {
        'border-t border-solid border-ds-gray-tertiary': showTopBorder,
        'pt-6': addTopPadding,
      })}
      data-testid="file-viewer-wrapper"
    >
      <ToggleHeader
        title={title}
        flagNames={flagNames}
        coverageIsLoading={coverageIsLoading}
        onFlagsChange={setSelectedFlags}
      />
      <div id={path} className="target:ring">
        <CodeRendererProgressHeader
          path={path} // This is only populated in standalone fileviewer
          pathRef={ref} // This is only populated in standalone fileviewer
          fileCoverage={fileCoverage}
        />
        {!!isCriticalFile && <CriticalFileLabel variant="borderTop" />}
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

RawFileviewer.propTypes = {
  title: PropType.oneOfType([PropType.string, PropType.object]),
  showTopBorder: PropType.bool,
  addTopPadding: PropType.bool,
}

export default RawFileviewer
