import { cn } from 'shared/utils/cn'

interface TestResult {
  id: string
  name: string
  duration: number
  status: 'passed' | 'failed' | 'skipped'
  timestamp: number
  branch: string
}

interface ChartDataPoint {
  date: string
  passed: number
  failed: number
  skipped: number
  totalDuration: number
}

interface TestResultsChartProps {
  results: TestResult[]
}

export function TestResultsChart({ results }: TestResultsChartProps) {
  if (!results || results.length === 0) {
    return null
  }

  const chartDataMap = results.reduce(
    (acc: Record<string, ChartDataPoint>, result) => {
      if (
        !result.timestamp ||
        !Number.isFinite(result.timestamp) ||
        result.timestamp < 0
      ) {
        return acc
      }

      const dateObj = new Date(result.timestamp)
      if (isNaN(dateObj.getTime())) {
        return acc
      }

      if (
        !result.status ||
        !['passed', 'failed', 'skipped'].includes(result.status)
      ) {
        return acc
      }

      const date = dateObj.toLocaleDateString()

      if (!acc[date]) {
        acc[date] = {
          date,
          passed: 0,
          failed: 0,
          skipped: 0,
          totalDuration: 0,
        }
      }

      const dataPoint = acc[date]
      if (dataPoint) {
        dataPoint[result.status]++
        const duration =
          Number.isFinite(result.duration) && result.duration >= 0
            ? result.duration
            : 0
        dataPoint.totalDuration += duration
      }

      return acc
    },
    {}
  )

  const chartData = Object.values(chartDataMap)

  const slowestTests = results
    .filter((result) => result.status !== 'skipped')
    .filter(
      (result) => Number.isFinite(result.duration) && result.duration >= 0
    )
    .sort((a, b) => b.duration - a.duration)
    .slice(0, 10)

  const branchStats = results.reduce(
    (
      acc: Record<
        string,
        { total: number; failed: number; avgDuration: number }
      >,
      result
    ) => {
      if (!result.branch) {
        return acc
      }

      if (!acc[result.branch]) {
        acc[result.branch] = { total: 0, failed: 0, avgDuration: 0 }
      }
      const branchData = acc[result.branch]
      if (branchData) {
        branchData.total++
        if (result.status === 'failed') {
          branchData.failed++
        }

        const duration =
          Number.isFinite(result.duration) && result.duration >= 0
            ? result.duration
            : 0
        branchData.avgDuration =
          (branchData.avgDuration * (branchData.total - 1) + duration) /
          branchData.total
      }
      return acc
    },
    {}
  )

  const testsByName = results.reduce(
    (acc: Record<string, TestResult[]>, result) => {
      if (!result.name) {
        return acc
      }

      if (!acc[result.name]) {
        acc[result.name] = []
      }
      acc[result.name]?.push(result)
      return acc
    },
    {}
  )

  const flakinessScores: Record<string, number> = {}
  Object.entries(testsByName).forEach(([testName, testResults]) => {
    if (testResults.length === 0) {
      return
    }

    const sortedResults = [...testResults].sort(
      (a, b) => a.timestamp - b.timestamp
    )

    let statusChanges = 0
    for (let i = 1; i < sortedResults.length; i++) {
      const current = sortedResults[i]
      const previous = sortedResults[i - 1]
      if (current && previous && current.status !== previous.status) {
        statusChanges++
      }
    }
    flakinessScores[testName] = (statusChanges / sortedResults.length) * 100
  })

  const flakyTests = Object.entries(flakinessScores)
    .filter(([, score]) => score > 20)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-4 text-xl font-semibold">Test Results Over Time</h2>
        <div className="space-y-2">
          {chartData.map((point) => (
            <div
              key={point.date}
              className="flex items-center gap-4 rounded border border-ds-gray-tertiary p-3"
            >
              <span className="w-24 text-sm">{point.date}</span>
              <div className="flex flex-1 gap-2">
                <div className="flex items-center gap-2">
                  <div className="size-3 rounded-full bg-ds-primary-green" />
                  <span className="text-sm">{point.passed}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="size-3 rounded-full bg-ds-primary-red" />
                  <span className="text-sm">{point.failed}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="size-3 rounded-full bg-ds-gray-quinary" />
                  <span className="text-sm">{point.skipped}</span>
                </div>
              </div>
              <span className="text-sm text-ds-gray-senary">
                {Number.isFinite(point.totalDuration)
                  ? (point.totalDuration / 1000).toFixed(2)
                  : '0.00'}
                s
              </span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-lg font-semibold">Slowest Tests</h3>
        <div className="space-y-2">
          {slowestTests.map((test) => (
            <div
              key={test.id}
              className="flex items-center justify-between rounded border border-ds-gray-tertiary p-3"
            >
              <span className="font-mono text-sm">{test.name}</span>
              <span className="text-sm font-semibold text-ds-primary-yellow">
                {Number.isFinite(test.duration)
                  ? (test.duration / 1000).toFixed(2)
                  : '0.00'}
                s
              </span>
            </div>
          ))}
        </div>
      </div>

      {flakyTests.length > 0 && (
        <div>
          <h3 className="mb-3 text-lg font-semibold">Flaky Tests</h3>
          <div className="space-y-2">
            {flakyTests.map(([name, score]) => (
              <div
                key={name}
                className="flex items-center justify-between rounded border border-ds-primary-red p-3"
              >
                <span className="font-mono text-sm">{name}</span>
                <span className="text-sm font-semibold text-ds-primary-red">
                  {score.toFixed(1)}% flaky
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="mb-3 text-lg font-semibold">Branch Statistics</h3>
        <div className="grid grid-cols-3 gap-4">
          {Object.entries(branchStats).map(([branch, stats]) => (
            <div
              key={branch}
              className={cn(
                'rounded border p-4',
                stats.failed > 0
                  ? 'border-ds-primary-red bg-ds-pink-default'
                  : 'border-ds-gray-tertiary bg-white'
              )}
            >
              <h4 className="font-mono text-sm font-semibold">{branch}</h4>
              <div className="mt-2 space-y-1 text-xs">
                <div>Total: {stats.total}</div>
                <div className="text-ds-primary-red">
                  Failed: {stats.failed}
                </div>
                <div>
                  Avg:{' '}
                  {Number.isFinite(stats.avgDuration)
                    ? stats.avgDuration.toFixed(0)
                    : '0'}
                  ms
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default TestResultsChart
