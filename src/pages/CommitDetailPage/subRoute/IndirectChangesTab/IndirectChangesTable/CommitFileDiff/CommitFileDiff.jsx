import without from 'lodash/without'
import PropTypes from 'prop-types'
import { Fragment } from 'react'
import { useParams } from 'react-router-dom'

import { useIgnoredIds } from 'pages/CommitDetailPage/hooks/useIgnoredIds'
import { useComparisonForCommitAndParent } from 'services/comparison/useComparisonForCommitAndParent'
import { transformImpactedFileData } from 'services/comparison/utils'
import { useNavLinks } from 'services/navigation'
import { CODE_RENDERER_TYPE } from 'shared/utils/fileviewer'
import A from 'ui/A'
import CodeRenderer from 'ui/CodeRenderer'
import CodeRendererInfoRow from 'ui/CodeRenderer/CodeRendererInfoRow'
import CriticalFileLabel from 'ui/CodeRenderer/CriticalFileLabel'
import DiffLine from 'ui/CodeRenderer/DiffLine'
import Spinner from 'ui/Spinner'

function ErrorDisplayMessage() {
  return (
    <p className="border border-solid border-ds-gray-tertiary p-4">
      There was a problem getting the source code from your provider. Unable to
      show line by line coverage.
    </p>
  )
}

const Loader = () => (
  <div className="flex items-center justify-center py-16">
    <Spinner />
  </div>
)

// eslint-disable-next-line max-statements
function CommitFileDiff({ path }) {
  const { owner, repo, provider, commit } = useParams()
  const { commitFileDiff } = useNavLinks()

  const { data: ignoredUploadIds } = useIgnoredIds()

  const { data: comparisonData, isLoading } = useComparisonForCommitAndParent({
    provider,
    owner,
    repo,
    commitid: commit,
    path,
    filters: {
      hasUnintendedChanges: true,
    },
    opts: {
      select: (res) =>
        transformImpactedFileData(
          res?.data?.owner?.repository?.commit?.compareWithParent?.impactedFile
        ),
    },
  })

  if (isLoading) {
    return <Loader />
  }

  if (!comparisonData) {
    return <ErrorDisplayMessage />
  }

  const { fileLabel, headName, isCriticalFile, segments } = comparisonData
  return (
    <>
      {isCriticalFile && <CriticalFileLabel variant="borderTop" />}
      {segments?.map((segment, segmentIndex) => {
        const content = segment.lines.map((line) => line.content).join('\n')
        return (
          <Fragment key={`${headName}-${segmentIndex}`}>
            <CodeRendererInfoRow>
              <div className="flex w-full justify-between">
                <div className="flex gap-1">
                  <span data-testid="patch">{segment?.header}</span>
                  {fileLabel && (
                    <span className="border-l-2 pl-2">{fileLabel}</span>
                  )}
                </div>
                <A
                  href={commitFileDiff.path({ commit, tree: path })}
                  isExternal
                  hook="commit full file"
                >
                  View full file
                </A>
              </div>
            </CodeRendererInfoRow>
            <CodeRenderer
              code={content}
              fileName={headName}
              rendererType={CODE_RENDERER_TYPE.DIFF}
              LineComponent={({ i, line, ...props }) => (
                <DiffLine
                  // If this line one of the first 3 or last three lines of the segment
                  key={i + 1}
                  lineContent={line}
                  edgeOfFile={i <= 2 || i >= segment.lines.length - 3}
                  path={comparisonData?.hashedPath}
                  hitCount={
                    without(
                      segment?.lines?.[i]?.coverageInfo?.hitUploadIds,
                      ...ignoredUploadIds
                    ).length
                  }
                  {...props}
                  {...segment.lines[i]}
                />
              )}
            />
          </Fragment>
        )
      })}
    </>
  )
}

CommitFileDiff.propTypes = {
  path: PropTypes.string,
}

export default CommitFileDiff
