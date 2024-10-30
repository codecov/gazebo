import { Fragment, useMemo } from 'react'
import { useParams } from 'react-router-dom'

import { useNavLinks } from 'services/navigation'
import {
  PullImpactedFile,
  useSingularImpactedFileComparison,
} from 'services/pull'
import { useRepoOverview } from 'services/repo'
import A from 'ui/A'
import CodeRendererInfoRow from 'ui/CodeRenderer/CodeRendererInfoRow'
import CriticalFileLabel from 'ui/CodeRenderer/CriticalFileLabel'
import {
  type CoverageValue,
  type LineData,
  VirtualDiffRenderer,
} from 'ui/VirtualRenderers/VirtualDiffRenderer'

function transformSegmentsToLineData(
  segments: PullImpactedFile['segments']['results'] | undefined
) {
  if (!segments) {
    return []
  }
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
  impactedFile: ReturnType<typeof useSingularImpactedFileComparison>['data']
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
      {impactedFile?.isCriticalFile && (
        <CriticalFileLabel variant="borderTop" />
      )}
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

interface PullFileDiffProps {
  path: string | null | undefined
}

function PullFileDiff({ path }: PullFileDiffProps) {
  const { provider, owner, repo, pullId } = useParams<URLParams>()
  const { data } = useSingularImpactedFileComparison({
    provider,
    owner,
    repo,
    pullId,
    path: path ?? '',
    filters: { hasUnintendedChanges: true },
  })

  if (!data || typeof path !== 'string') {
    return <ErrorDisplayMessage />
  }

  return <DiffRenderer impactedFile={data} path={path} />
}

export default PullFileDiff
