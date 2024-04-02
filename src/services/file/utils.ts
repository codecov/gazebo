import keyBy from 'lodash/keyBy'
import mapValues from 'lodash/mapValues'

import { PathContentsRepositorySchema } from 'services/pathContents/constants'

export function extractCoverageFromResponse(
  repository: PathContentsRepositorySchema | undefined | null
) {
  if (!repository) return null
  const commit = repository?.commit
  const branch = repository?.branch?.head
  const coverageSource = commit || branch
  const coverageFile = coverageSource?.coverageFile
  if (!coverageFile) return null
  const lineWithCoverage = keyBy(coverageFile?.coverage, 'line')
  const fileCoverage = mapValues(lineWithCoverage, 'coverage')
  const coverageTotal = coverageFile?.totals?.coverage
  const hashedPath = coverageFile?.hashedPath

  return {
    content: coverageFile?.content,
    coverage: fileCoverage,
    totals:
      typeof coverageTotal !== 'number' || isNaN(coverageTotal)
        ? 0
        : coverageTotal,
    flagNames: coverageSource?.flagNames ?? [],
    isCriticalFile: !!coverageFile?.isCriticalFile,
    ...(hashedPath && { hashedPath }),
  }
}
