import PropTypes from 'prop-types'
import { useState } from 'react'
import { useParams } from 'react-router-dom'

import NotFound from 'pages/NotFound'
import { useCommitBasedCoverageForFileViewer } from 'services/file'
import { useOwner } from 'services/user'
import { CODE_RENDERER_TYPE } from 'shared/utils/fileviewer'
import { unsupportedExtensionsMapper } from 'shared/utils/unsupportedExtensionsMapper'
import { getFilenameFromFilePath } from 'shared/utils/url'
import CodeRenderer from 'ui/CodeRenderer'
import CodeRendererProgressHeader from 'ui/CodeRenderer/CodeRendererProgressHeader'
import CriticalFileLabel from 'ui/CodeRenderer/CriticalFileLabel'
import SingleLine from 'ui/CodeRenderer/SingleLine'
import ToggleHeader from 'ui/FileViewer/ToggleHeader'
import Title from 'ui/FileViewer/ToggleHeader/Title'

function ErrorDisplayMessage() {
  return (
    <div className="border border-solid border-ds-gray-tertiary p-4">
      <p>
        There was a problem getting the source code from your provider. Unable
        to show line by line coverage.
      </p>
    </div>
  )
}

function FileTitle({
  title,
  sticky,
  withKey,
  coverageIsLoading,
  setSelectedFlags,
}) {
  if (withKey) {
    return (
      <ToggleHeader
        title={title}
        sticky={sticky}
        coverageIsLoading={coverageIsLoading}
        onFlagsChange={setSelectedFlags}
      />
    )
  }
  return <Title title={title} sticky={sticky} />
}

FileTitle.propTypes = {
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  sticky: PropTypes.bool,
  withKey: PropTypes.bool,
  coverageIsLoading: PropTypes.bool,
  setSelectedFlags: PropTypes.func,
}

function CodeRendererContent({
  isUnsupportedFileType,
  content,
  path,
  coverageData,
  stickyPadding,
}) {
  if (isUnsupportedFileType) {
    return (
      <div className="border border-solid border-ds-gray-tertiary p-2">
        This is a binary file that contains now coverable lines.
      </div>
    )
  }

  if (content) {
    return (
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
            stickyPadding={stickyPadding}
          />
        )}
      />
    )
  }

  return <ErrorDisplayMessage />
}

CodeRendererContent.propTypes = {
  isUnsupportedFileType: PropTypes.bool,
  content: PropTypes.object,
  path: PropTypes.string,
  coverageData: PropTypes.object,
  stickyPadding: PropTypes.bool,
}

// Note: This component is both used in the standalone fileviewer page and in the overview page. Changing this
// component will affect both places
function RawFileViewer({
  title,
  sticky = false,
  withKey = true,
  stickyPadding,
  commit,
}) {
  const { owner, repo, provider, path } = useParams()
  const { data: ownerData } = useOwner({ username: owner })
  const [selectedFlags, setSelectedFlags] = useState([])
  const isUnsupportedFileType = unsupportedExtensionsMapper({ path })

  // TODO: This hook needs revision/enhancement
  const {
    content,
    totals: fileCoverage,
    coverage: coverageData,
    isLoading: coverageIsLoading,
    isCriticalFile,
  } = useCommitBasedCoverageForFileViewer({
    owner,
    repo,
    provider,
    commit,
    path,
    selectedFlags,
    opts: {
      enabled: !isUnsupportedFileType,
    },
  })

  if (!ownerData) {
    return <NotFound />
  }

  return (
    <div className="flex flex-col" data-testid="file-viewer-wrapper">
      <FileTitle
        withKey={withKey}
        title={title}
        sticky={sticky}
        coverageIsLoading={coverageIsLoading}
        onFlagsChange={setSelectedFlags}
      />
      <div id={path} className="target:ring">
        <CodeRendererProgressHeader path={path} fileCoverage={fileCoverage} />
        {!!isCriticalFile && <CriticalFileLabel variant="borderTop" />}
        <CodeRendererContent
          isUnsupportedFileType={isUnsupportedFileType}
          content={content}
          path={path}
          coverageData={coverageData}
          stickyPadding={stickyPadding}
        />
      </div>
    </div>
  )
}

RawFileViewer.propTypes = {
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  sticky: PropTypes.bool,
  withKey: PropTypes.bool,
  stickyPadding: PropTypes.number,
  commit: PropTypes.string,
}

export default RawFileViewer
