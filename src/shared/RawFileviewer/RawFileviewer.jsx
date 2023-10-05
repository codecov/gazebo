import PropTypes from 'prop-types'
import { useParams } from 'react-router-dom'

import NotFound from 'pages/NotFound'
import { useCommitBasedCoverageForFileViewer } from 'services/file'
import { useLocationParams } from 'services/navigation'
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
  showFlagsSelect,
}) {
  if (withKey) {
    return (
      <ToggleHeader
        title={title}
        sticky={sticky}
        coverageIsLoading={coverageIsLoading}
        showFlagsSelect={showFlagsSelect}
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
  showFlagsSelect: PropTypes.bool,
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
        Unable to display contents of binary file included in coverage reports.
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
  content: PropTypes.string,
  path: PropTypes.string,
  coverageData: PropTypes.object,
  stickyPadding: PropTypes.number,
}

const defaultQueryParams = {
  flags: [],
}

// Note: This component is both used in the standalone file viewer page and in the overview page. Changing this
// component will affect both places
function RawFileViewer({
  title,
  sticky = false,
  withKey = true,
  stickyPadding,
  commit,
  showFlagsSelect,
}) {
  const { owner, repo, provider, path: urlPath } = useParams()
  const { params } = useLocationParams(defaultQueryParams)
  const path = decodeURIComponent(urlPath)
  const { data: ownerData } = useOwner({ username: owner })

  const isUnsupportedFileType = unsupportedExtensionsMapper({ path })

  // TODO: This hook needs revision/enhancement
  const {
    content,
    totals: fileCoverage,
    coverage: coverageData,
    isCriticalFile,
  } = useCommitBasedCoverageForFileViewer({
    owner,
    repo,
    provider,
    commit,
    path,
    selectedFlags: params?.flags,
    opts: {
      enabled: !isUnsupportedFileType,
    },
  })

  if (!ownerData) {
    return <NotFound />
  }

  return (
    <div className="flex flex-col gap-3 py-3" data-testid="file-viewer-wrapper">
      <FileTitle
        withKey={withKey}
        title={title}
        sticky={sticky}
        showFlagsSelect={showFlagsSelect}
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
  showFlagsSelect: PropTypes.bool,
}

export default RawFileViewer
