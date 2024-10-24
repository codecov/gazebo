import without from 'lodash/without'
import { Fragment, useMemo } from 'react'
import { useParams } from 'react-router-dom'

import { useIgnoredIds } from 'pages/CommitDetailPage/hooks/useIgnoredIds'
import {
  ImpactedFileType,
  useComparisonForCommitAndParent,
} from 'services/comparison/useComparisonForCommitAndParent'
import { transformImpactedFileData } from 'services/comparison/utils'
import { useNavLinks } from 'services/navigation'
import { useRepoOverview } from 'services/repo'
import A from 'ui/A'
import CodeRendererInfoRow from 'ui/CodeRenderer/CodeRendererInfoRow'
import CriticalFileLabel from 'ui/CodeRenderer/CriticalFileLabel'
import {
  CoverageValue,
  LineData,
  VirtualDiffRenderer,
} from 'ui/VirtualRenderers/VirtualDiffRenderer'

function ErrorDisplayMessage() {
  return (
    <p className="border border-solid border-ds-gray-tertiary p-4">
      There was a problem getting the source code from your provider. Unable to
      show line by line coverage.
      <br />
      <span>
        If you continue to experience this issue, please try{' '}
        <A
          to={{
            pageName: 'login',
          }}
          hook={undefined}
          isExternal={undefined}
        >
          logging in
        </A>{' '}
        again to refresh your credentials.
      </span>
    </p>
  )
}

function DiffRenderer({
  impactedFile,
  path,
}: {
  impactedFile: ImpactedFileType
  path: string
}) {
  const { commitFileDiff } = useNavLinks()
  const { provider, owner, repo, commit } = useParams<URLParams>()
  const { data: overview } = useRepoOverview({ provider, owner, repo })
  const { data: ignoredUploadIds } = useIgnoredIds()

  const memoizedData = useMemo(() => {
    const transformedData = transformImpactedFileData(impactedFile)

    const modifiedSegments = transformedData?.segments?.map((segment) => {
      let newDiffContent = ''
      const lineData: LineData[] = []

      segment.lines.forEach((line, lineIndex) => {
        newDiffContent += line.content

        if (lineIndex < segment.lines.length - 1) {
          newDiffContent += '\n'
        }

        lineData.push({
          headNumber: line?.headNumber,
          baseNumber: line?.baseNumber,
          headCoverage: line?.headCoverage as CoverageValue,
          baseCoverage: line?.baseCoverage as CoverageValue,
          hitCount: without(
            line?.coverageInfo?.hitUploadIds,
            ...ignoredUploadIds
          ).length,
        })
      })

      return { ...segment, lineData, newDiffContent }
    })

    return { ...transformedData, segments: modifiedSegments }
  }, [ignoredUploadIds, impactedFile])

  let fullFilePath = commitFileDiff.path({ commit, tree: path })
  if (overview?.coverageEnabled && overview?.bundleAnalysisEnabled) {
    fullFilePath = `${fullFilePath}?dropdown=coverage`
  }
  const hashedPath = impactedFile?.hashedPath

  return (
    <>
      {memoizedData?.isCriticalFile && (
        <CriticalFileLabel variant="borderTop" />
      )}
      {memoizedData?.segments?.map((segment, segmentIndex) => {
        return (
          <Fragment key={`${memoizedData?.headName}-${segmentIndex}`}>
            <CodeRendererInfoRow>
              <div className="flex w-full justify-between">
                <div className="flex gap-1">
                  <span data-testid="patch">{segment?.header}</span>
                  {memoizedData?.fileLabel && (
                    <span className="border-l-2 pl-2">
                      {memoizedData?.fileLabel}
                    </span>
                  )}
                </div>
                {/* @ts-expect-error TODO: Anchor tag */}
                <A href={fullFilePath} isExternal hook="commit full file">
                  View full file
                </A>
              </div>
            </CodeRendererInfoRow>
            <VirtualDiffRenderer
              key={segmentIndex}
              code={segment?.newDiffContent}
              fileName={memoizedData?.headName ?? ''}
              hashedPath={hashedPath}
              lineData={segment?.lineData}
            />
          </Fragment>
        )
      })}
    </>
  )
}

interface URLParams {
  provider: string
  owner: string
  repo: string
  commit: string
}

interface CommitFileDiffProps {
  path: string | null | undefined
}

function CommitFileDiff({ path }: CommitFileDiffProps) {
  const { provider, owner, repo, commit } = useParams<URLParams>()

  const { data: comparisonData } = useComparisonForCommitAndParent({
    provider,
    owner,
    repo,
    commitid: commit,
    path: path ?? '',
    filters: { hasUnintendedChanges: false },
    opts: { enabled: !!path },
  })

  if (!comparisonData || !comparisonData?.impactedFile || !path) {
    return <ErrorDisplayMessage />
  }

  return <DiffRenderer impactedFile={comparisonData.impactedFile} path={path} />
}

export default CommitFileDiff
