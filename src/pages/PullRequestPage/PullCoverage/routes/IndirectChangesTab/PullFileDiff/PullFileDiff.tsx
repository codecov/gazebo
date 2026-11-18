import { Fragment, useMemo } from 'react'
import { useLocation, useParams } from 'react-router-dom'

import { useNavLinks } from 'services/navigation/useNavLinks'
import { useSingularImpactedFileComparison } from 'services/pull/useSingularImpactedFileComparison'
import { transformImpactedPullFileToDiff } from 'services/pull/utils'
import { useRepoOverview } from 'services/repo'
import A from 'ui/A'
import CodeRendererInfoRow from 'ui/CodeRenderer/CodeRendererInfoRow'
import {
  type CoverageValue,
  type LineData,
  VirtualDiffRenderer,
} from 'ui/VirtualRenderers/VirtualDiffRenderer'

function transformSegmentsToLineData(
  segments:
    | NonNullable<
        ReturnType<typeof transformImpactedPullFileToDiff>
      >['segments']
    | undefined
) {
  if (
    !segments ||
    segments.__typename !== 'SegmentComparisons' ||
    !segments.results
  ) {
    return []
  }
  return segments.results.map((segment) => {
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
        hitCount: undefined,
      })
    })
    return { ...segment, lineData, newDiffContent }
  })
}

interface URLParams {
  provider: string
  owner: string
  repo: string
  pullId: string
}

function DiffRenderer({
  impactedFile,
  path,
}: {
  impactedFile: ReturnType<typeof transformImpactedPullFileToDiff>
  path: string
}) {
  const { pullFileView } = useNavLinks()
  const { provider, owner, repo, pullId } = useParams<URLParams>()
  const { data: overview } = useRepoOverview({ provider, owner, repo })
  const fileDiff = useMemo(() => {
    return transformSegmentsToLineData(impactedFile?.segments)
  }, [impactedFile])
  let fullFilePath = pullFileView.path({
    pullId,
    tree: path,
  })
  if (overview?.coverageEnabled && overview?.bundleAnalysisEnabled) {
    fullFilePath = `${fullFilePath}?dropdown=coverage`
  }
  return (
    <>
      {fileDiff?.map((segment, segmentIndex) => {
        return (
          <Fragment key={`${impactedFile?.headName}-${segmentIndex}`}>
            <CodeRendererInfoRow>
              <div className="flex w-full justify-between">
                <div className="flex gap-1">
                  <span data-testid="patch">{segment?.header}</span>
                  {impactedFile?.fileLabel && (
                    <span className="border-l-2 pl-2">
                      {impactedFile.fileLabel}
                    </span>
                  )}
                </div>
                {/* @ts-expect-error TODO: Anchor tag */}
                <A href={fullFilePath} isExternal hook="pull full file">
                  View full file
                </A>
              </div>
            </CodeRendererInfoRow>
            <VirtualDiffRenderer
              key={segmentIndex}
              code={segment.newDiffContent}
              fileName={impactedFile?.headName ?? ''}
              hashedPath={impactedFile?.hashedPath ?? ''}
              lineData={segment.lineData}
            />
          </Fragment>
        )
      })}
    </>
  )
}

function ErrorDisplayMessage() {
  const location = useLocation()

  return (
    <p className="border border-solid border-ds-gray-tertiary p-4">
      There was a problem getting the source code from your provider. Unable to
      show line by line coverage.
      <br />
      <span>
        If you continue to experience this issue, please try{' '}
        <A
          to={{ pageName: 'login', options: { to: location.pathname } }}
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

function UnknownPathErrorDisplayMessage({ path }: { path: string }) {
  const location = useLocation()

  return (
    <p className="border border-solid border-ds-gray-tertiary p-4">
      There was a problem getting the source code from your provider by path
      for: <strong>{path}</strong>. Unable to show line by line coverage.
      <br />
      <span>
        If you continue to experience this issue, please try{' '}
        <A
          to={{ pageName: 'login', options: { to: location.pathname } }}
          hook={undefined}
          isExternal={undefined}
        >
          logging in
        </A>{' '}
        again to refresh your credentials. Otherwise, please visit our{' '}
        <A
          to={{ pageName: 'pathFixing', options: { to: location.pathname } }}
          hook={undefined}
          isExternal={undefined}
        >
          Path Fixing
        </A>{' '}
        documentation for troubleshooting tips.
      </span>
    </p>
  )
}

interface PullFileDiffProps {
  path: string | null | undefined
}

function PullFileDiff({ path }: PullFileDiffProps) {
  const { provider, owner, repo, pullId } = useParams<URLParams>()
  const { data: impactedFile } = useSingularImpactedFileComparison({
    provider,
    owner,
    repo,
    pullId,
    path: path ?? '',
    filters: { hasUnintendedChanges: true },
  })

  const segments = impactedFile?.segments

  if (
    !impactedFile ||
    typeof path !== 'string' ||
    !segments ||
    segments.__typename === 'ProviderError'
  ) {
    return <ErrorDisplayMessage />
  }

  if (segments.__typename === 'UnknownPath') {
    return <UnknownPathErrorDisplayMessage path={path} />
  }

  // Transform the data to form needed for rendering
  const data = transformImpactedPullFileToDiff(impactedFile)

  return <DiffRenderer impactedFile={data} path={path} />
}

export default PullFileDiff
