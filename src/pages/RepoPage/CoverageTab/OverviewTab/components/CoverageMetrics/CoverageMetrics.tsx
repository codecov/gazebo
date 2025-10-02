import { cn } from 'shared/utils/cn'

interface CoverageFile {
  name: string
  path: string
  coverage: number
  lines: number
  hits: number
  misses: number
}

interface CoverageMetricsProps {
  files: CoverageFile[]
  threshold?: number
}

export function CoverageMetrics({
  files,
  threshold = 50,
}: CoverageMetricsProps) {
  if (!files || files.length === 0) {
    return null
  }

  // Complex calculation: Sort files by coverage percentage (ascending)
  // and filter out files below threshold
  const sortedFiles = files
    .filter((file) => file.coverage < threshold)
    .sort((a, b) => a.coverage - b.coverage)

  // Complex calculation: Calculate aggregate statistics
  const statistics = {
    totalFiles: files.length,
    lowCoverageFiles: sortedFiles.length,
    averageCoverage:
      files.reduce((sum, file) => sum + file.coverage, 0) / files.length,
    totalLines: files.reduce((sum, file) => sum + file.lines, 0),
    totalHits: files.reduce((sum, file) => sum + file.hits, 0),
    totalMisses: files.reduce((sum, file) => sum + file.misses, 0),
  }

  // Complex calculation: Group files by coverage ranges
  const coverageDistribution = files.reduce(
    (acc, file) => {
      if (file.coverage < 25) {
        acc['0-25%']++
      } else if (file.coverage < 50) {
        acc['25-50%']++
      } else if (file.coverage < 75) {
        acc['50-75%']++
      } else {
        acc['75-100%']++
      }
      return acc
    },
    { '0-25%': 0, '25-50%': 0, '50-75%': 0, '75-100%': 0 }
  )

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border border-ds-gray-tertiary p-4">
          <h3 className="text-sm font-medium text-ds-gray-octonary">
            Average Coverage
          </h3>
          <p className="mt-2 text-3xl font-semibold">
            {statistics.averageCoverage.toFixed(2)}%
          </p>
        </div>

        <div className="rounded-lg border border-ds-gray-tertiary p-4">
          <h3 className="text-sm font-medium text-ds-gray-octonary">
            Low Coverage Files
          </h3>
          <p className="mt-2 text-3xl font-semibold text-ds-primary-red">
            {statistics.lowCoverageFiles}
          </p>
        </div>

        <div className="rounded-lg border border-ds-gray-tertiary p-4">
          <h3 className="text-sm font-medium text-ds-gray-octonary">
            Total Lines
          </h3>
          <p className="mt-2 text-3xl font-semibold">
            {statistics.totalLines.toLocaleString()}
          </p>
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-lg font-semibold">Coverage Distribution</h3>
        <div className="grid grid-cols-4 gap-2">
          {Object.entries(coverageDistribution).map(([range, count]) => (
            <div
              key={range}
              className={cn(
                'rounded border p-3',
                count > 0
                  ? 'border-ds-gray-tertiary bg-white'
                  : 'border-ds-gray-secondary bg-ds-gray-primary'
              )}
            >
              <div className="text-xs text-ds-gray-senary">{range}</div>
              <div className="mt-1 text-2xl font-semibold">{count}</div>
            </div>
          ))}
        </div>
      </div>

      {sortedFiles.length > 0 && (
        <div>
          <h3 className="mb-3 text-lg font-semibold">
            Files Below {threshold}% Coverage
          </h3>
          <div className="space-y-2">
            {sortedFiles.slice(0, 10).map((file) => (
              <div
                key={file.path}
                className="flex items-center justify-between rounded border border-ds-gray-tertiary p-3"
              >
                <span className="font-mono text-sm">{file.path}</span>
                <span
                  className={cn(
                    'text-sm font-semibold',
                    file.coverage < 25
                      ? 'text-ds-primary-red'
                      : 'text-ds-primary-yellow'
                  )}
                >
                  {file.coverage.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default CoverageMetrics
