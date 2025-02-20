import { useQuery as useQueryV5 } from '@tanstack/react-queryV5'
import { Fragment, useMemo } from 'react'
import { useParams } from 'react-router-dom'

import { IgnoredIdsQueryOptions } from 'pages/CommitDetailPage/queries/IgnoredIdsQueryOptions'
import {
  ImpactedFileType,
  useComparisonForCommitAndParent,
} from 'services/comparison/useComparisonForCommitAndParent'
import { transformImpactedFileToDiff } from 'services/comparison/utils'
import { useNavLinks } from 'services/navigation'
import { useRepoOverview } from 'services/repo'
import A from 'ui/A'
import CodeRendererInfoRow from 'ui/CodeRenderer/CodeRendererInfoRow'
import {
  CoverageValue,
  LineData,
  VirtualDiffRenderer,
} from 'ui/VirtualRenderers/VirtualDiffRenderer'

function transformSegmentsToLineData(
  segments: ImpactedFileType['segments']['results'] | undefined,
  ignoredUploadIds: number[]
) {
  if (!segments) {
    return []
  }

  const ignoredUploadIdsSet = new Set(ignoredUploadIds)

  return segments.map((segment) => {
    // we need to create a string of the diff content for the virtual diff renderer text area
    let newDiffContent = ''
    const lineData: LineData[] = []

    segment.lines.forEach((line, lineIndex) => {
      newDiffContent += line.content

      // only add a newline if it's not the last line
      if (lineIndex !== segment.lines.length - 1) {
        newDiffContent += '\n'
      }

      lineData.push({
        headNumber: line?.headNumber,
        baseNumber: line?.baseNumber,
        headCoverage: line?.headCoverage as CoverageValue,
        baseCoverage: line?.baseCoverage as CoverageValue,
        hitCount: line?.coverageInfo?.hitUploadIds?.reduce(
          (count, value) =>
            ignoredUploadIdsSet.has(value) ? count : count + 1,
          0
        ),
      })
    })

    return { ...segment, lineData, newDiffContent }
  })
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
  const { data: ignoredUploadIds } = useQueryV5(IgnoredIdsQueryOptions())

  const fileDiff = useMemo(() => {
    const transformedData = transformImpactedFileToDiff(impactedFile)

    const modifiedSegments = transformSegmentsToLineData(
      transformedData?.segments,
      ignoredUploadIds
    )

    return { ...transformedData, segments: modifiedSegments }
  }, [ignoredUploadIds, impactedFile])

  let fullFilePath = commitFileDiff.path({ commit, tree: path })
  if (overview?.coverageEnabled && overview?.bundleAnalysisEnabled) {
    fullFilePath = `${fullFilePath}?dropdown=coverage`
  }

  return (
    <>
      {fileDiff?.segments?.map((segment, segmentIndex) => {
        return (
          <Fragment key={`${fileDiff?.headName}-${segmentIndex}`}>
            <CodeRendererInfoRow>
              <div className="flex w-full justify-between">
                <div className="flex gap-1">
                  <span data-testid="patch">{segment?.header}</span>
                  {fileDiff?.fileLabel && (
                    <span className="border-l-2 pl-2">
                      {fileDiff?.fileLabel}
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
              fileName={fileDiff?.headName ?? ''}
              hashedPath={impactedFile?.hashedPath}
              lineData={segment?.lineData}
            />
          </Fragment>
        )
      })}
    </>
  )
}

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
