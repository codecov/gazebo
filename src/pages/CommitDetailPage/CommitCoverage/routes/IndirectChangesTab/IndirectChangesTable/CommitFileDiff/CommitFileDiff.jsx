import without from 'lodash/without'
import PropTypes from 'prop-types'
import { Fragment } from 'react'
import { useParams } from 'react-router-dom'

import { useIgnoredIds } from 'pages/CommitDetailPage/hooks/useIgnoredIds'
import { useComparisonForCommitAndParent } from 'services/comparison/useComparisonForCommitAndParent'
import { transformImpactedFileData } from 'services/comparison/utils'
import { useNavLinks } from 'services/navigation'
import { useRepoOverview } from 'services/repo'
import { useFlags } from 'shared/featureFlags'
import {
  CODE_RENDERER_TYPE,
  STICKY_PADDING_SIZES,
} from 'shared/utils/fileviewer'
import A from 'ui/A'
import CodeRenderer from 'ui/CodeRenderer'
import CodeRendererInfoRow from 'ui/CodeRenderer/CodeRendererInfoRow'
import CriticalFileLabel from 'ui/CodeRenderer/CriticalFileLabel'
import DiffLine from 'ui/CodeRenderer/DiffLine'
import Spinner from 'ui/Spinner'
import { VirtualDiffRenderer } from 'ui/VirtualFileRenderer'

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

const NewDiffRenderer = ({
  headName,
  hashedPath,
  segments,
  ignoredUploadIds,
}) => {
  return segments?.map((segment, segmentIndex) => {
    let content = ''
    const lineData = []
    segment.lines.forEach((line, lineIndex) => {
      content += line.content

      if (lineIndex < segment.lines.length - 1) {
        content += '\n'
      }

      lineData.push({
        headNumber: line?.headNumber,
        baseNumber: line?.baseNumber,
        headCoverage: line?.headCoverage,
        baseCoverage: line?.baseCoverage,
        hitCount: without(line?.coverageInfo?.hitUploadIds, ...ignoredUploadIds)
          .length,
      })
    })

    return (
      <VirtualDiffRenderer
        key={segmentIndex}
        code={content}
        fileName={headName}
        hashedPath={hashedPath}
        lineData={lineData}
      />
    )
  })
}

const OldDiffRenderer = ({
  headName,
  fileLabel,
  fullFilePath,
  segments,
  ignoredUploadIds,
  stickyPadding,
  comparisonData,
}) => {
  return segments?.map((segment, segmentIndex) => {
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
            <A href={fullFilePath} isExternal hook="commit full file">
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
              stickyPadding={stickyPadding}
              {...props}
              {...segment.lines[i]}
            />
          )}
        />
      </Fragment>
    )
  })
}

function CommitFileDiff({ path }) {
  const { commitFileDiff } = useNavLinks()
  const { owner, repo, provider, commit } = useParams()
  const { data: overview } = useRepoOverview({ provider, owner, repo })
  const { virtualDiffRenderer } = useFlags({ virtualDiffRenderer: false })
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

  let stickyPadding = undefined
  let fullFilePath = commitFileDiff.path({ commit, tree: path })
  if (overview?.coverageEnabled && overview?.bundleAnalysisEnabled) {
    stickyPadding = STICKY_PADDING_SIZES.DIFF_LINE_DROPDOWN_PADDING
    fullFilePath = `${fullFilePath}?dropdown=coverage`
  }

  return (
    <>
      {isCriticalFile && <CriticalFileLabel variant="borderTop" />}
      {virtualDiffRenderer ? (
        <NewDiffRenderer
          headName={headName}
          hashedPath={comparisonData.hashedPath}
          segments={segments}
          ignoredUploadIds={ignoredUploadIds}
        />
      ) : (
        <OldDiffRenderer
          headName={headName}
          fileLabel={fileLabel}
          fullFilePath={fullFilePath}
          segments={segments}
          ignoredUploadIds={ignoredUploadIds}
          stickyPadding={stickyPadding}
          comparisonData={comparisonData}
        />
      )}
    </>
  )
}

CommitFileDiff.propTypes = {
  path: PropTypes.string,
}

export default CommitFileDiff
