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
  threshold?: number
}

/**
 * CoverageMetrics displays comprehensive coverage statistics for a repository.
 *
 * This component processes all files in a repository to calculate metrics.
 * Large repositories commonly have 2,000-10,000+ files, and enterprise repos
 * can exceed 50,000 files. The component handles the full file list for
 * accurate statistics rather than paginated subsets.
 *
 * Used in:
 * - RepoPage Coverage Overview Tab (main dashboard)
 * - PR coverage comparison views
 * - Commit detail coverage breakdown
 *
 * @param threshold - Coverage percentage threshold for highlighting low-coverage files
 */

// TODO: Replace with useCoverageFiles() hook that fetches from the API
// This sample data generator simulates production data with 5000 files
const generateSampleFiles = (): CoverageFile[] => {
  const directories = [
    'src/pages/RepoPage',
    'src/services',
    'src/layouts/Header',
    'src/ui/Button',
    'src/shared/utils',
    'tests/integration',
  ]
  const files: CoverageFile[] = []

  for (let i = 0; i < 5000; i++) {
    const dir = directories[i % directories.length]
    const coverage = Math.random() * 100
    const lines = Math.floor(Math.random() * 500) + 50
    const hits = Math.floor((coverage / 100) * lines)

    files.push({
      name: `File${i}.tsx`,
      path: `${dir}/File${i}.tsx`,
      coverage,
      lines,
      hits,
      misses: lines - hits,
    })
  }

  return files
}

export function CoverageMetrics({ threshold = 50 }: CoverageMetricsProps) {
  // TODO: Replace generateSampleFiles() with const files = useCoverageFiles()
  const files = generateSampleFiles()

  if (!files || files.length === 0) {
    return null
  }

  // Calculate comprehensive statistics in a single pass for efficiency
  const statistics = files.reduce(
    (acc, file) => {
      acc.totalFiles++
      acc.totalCoverage += file.coverage
      acc.totalLines += file.lines
      acc.totalHits += file.hits
      acc.totalMisses += file.misses

      if (file.coverage < threshold) {
        acc.lowCoverageFiles++
      }

      // Distribution buckets
      if (file.coverage < 25) {
        acc.distribution['0-25%']++
      } else if (file.coverage < 50) {
        acc.distribution['25-50%']++
      } else if (file.coverage < 75) {
        acc.distribution['50-75%']++
      } else {
        acc.distribution['75-100%']++
      }

      return acc
    },
    {
      totalFiles: 0,
      lowCoverageFiles: 0,
      totalCoverage: 0,
      totalLines: 0,
      totalHits: 0,
      totalMisses: 0,
      distribution: { '0-25%': 0, '25-50%': 0, '50-75%': 0, '75-100%': 0 },
    }
  )

  const averageCoverage =
    statistics.totalFiles > 0
      ? statistics.totalCoverage / statistics.totalFiles
      : 0
  const overallCoverageRate =
    statistics.totalLines > 0
      ? (statistics.totalHits / statistics.totalLines) * 100
      : 0
  const coverageDistribution = statistics.distribution

  const sortedFiles = files
    .filter((file) => file.coverage < threshold)
    .sort((a, b) => a.coverage - b.coverage)

  // Calculate directory-level statistics
  const directoryStats = files.reduce(
    (
      acc: Record<
        string,
        { files: number; avgCoverage: number; totalLines: number }
      >,
      file
    ) => {
      const directory = file.path.includes('/')
        ? file.path.substring(0, file.path.lastIndexOf('/'))
        : '(root)'

      if (!acc[directory]) {
        acc[directory] = { files: 0, avgCoverage: 0, totalLines: 0 }
      }

      const dirData = acc[directory]
      if (dirData) {
        dirData.files++
        dirData.avgCoverage =
          (dirData.avgCoverage * (dirData.files - 1) + file.coverage) /
          dirData.files
        dirData.totalLines += file.lines
      }

      return acc
    },
    {}
  )

  // Sort directories by lines of code
  const topDirectories = Object.entries(directoryStats)
    .sort(([, a], [, b]) => b.totalLines - a.totalLines)
    .slice(0, 5)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <div className="rounded-lg border border-ds-gray-tertiary p-4">
          <h3 className="text-sm font-medium text-ds-gray-octonary">
            Average Coverage
          </h3>
          <p className="mt-2 text-3xl font-semibold">
            {averageCoverage.toFixed(2)}%
          </p>
        </div>

        <div className="rounded-lg border border-ds-gray-tertiary p-4">
          <h3 className="text-sm font-medium text-ds-gray-octonary">
            Overall Rate
          </h3>
          <p className="mt-2 text-3xl font-semibold">
            {overallCoverageRate.toFixed(2)}%
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

      <div>
        <h3 className="mb-3 text-lg font-semibold">Top Directories by Size</h3>
        <div className="space-y-2">
          {topDirectories.map(([directory, stats]) => (
            <div
              key={directory}
              className="flex items-center justify-between rounded border border-ds-gray-tertiary p-3"
            >
              <div className="flex-1">
                <div className="font-mono text-sm">{directory}</div>
                <div className="mt-1 text-xs text-ds-gray-senary">
                  {stats.files} files • {stats.totalLines.toLocaleString()}{' '}
                  lines
                </div>
              </div>
              <div
                className={cn(
                  'text-sm font-semibold',
                  stats.avgCoverage < 50
                    ? 'text-ds-primary-red'
                    : stats.avgCoverage < 75
                      ? 'text-ds-primary-yellow'
                      : 'text-ds-primary-green'
                )}
              >
                {stats.avgCoverage.toFixed(1)}%
              </div>
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
