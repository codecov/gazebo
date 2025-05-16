import { PathContentsRepositorySchema } from './constants'

export function extractCoverageFromResponse(
  repository: PathContentsRepositorySchema | undefined | null
) {
  if (!repository) return null

  const commit = repository.commit
  const branch = repository.branch?.head
  const coverageSource = commit?.coverageAnalytics || branch?.coverageAnalytics
  const coverageFile = coverageSource?.coverageFile

  if (!coverageFile) return null

  const fileCoverage = Object.fromEntries(
    coverageFile.coverage?.map((item) => [item?.line, item?.coverage]) || []
  )
  const coverageTotal = coverageFile?.totals?.percentCovered
  const hashedPath = coverageFile?.hashedPath

  const result = {
    content: coverageFile?.content,
    coverage: fileCoverage,
    totals: coverageTotal && !Number.isNaN(coverageTotal) ? coverageTotal : 0,
    flagNames: coverageSource?.flagNames ?? [],
    componentNames: coverageSource?.components?.map(({ name }) => name) ?? [],
    ...(hashedPath && { hashedPath }),
  }

  return result
}

export type PrefetchBranchFileEntryCoverage = ReturnType<
  typeof extractCoverageFromResponse
>
