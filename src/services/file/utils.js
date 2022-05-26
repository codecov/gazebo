import keyBy from 'lodash/keyBy'
import mapValues from 'lodash/mapValues'

export function extractCoverageFromResponse(res) {
  const commit = res?.data?.owner?.repository?.commit
  const branch = res?.data?.owner?.repository?.branch?.head
  const coverageSource = commit || branch
  const coverageFile = coverageSource?.coverageFile
  if (!coverageFile) return null
  const lineWithCoverage = keyBy(coverageFile.coverage, 'line')
  const fileCoverage = mapValues(lineWithCoverage, 'coverage')
  const coverageTotal = coverageFile.totals?.coverage
  return {
    content: coverageFile.content,
    coverage: fileCoverage,
    totals: isNaN(coverageTotal) ? 0 : coverageTotal,
    flagNames: coverageSource?.flagNames ?? [],
  }
}
