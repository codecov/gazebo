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

  // Complex calculation: Transform test results into chart data by date
  const chartData = results.reduce((acc: ChartDataPoint[], result) => {
    const date = new Date(result.timestamp).toLocaleDateString()
    const existing = acc.find((item) => item.date === date)

    if (existing) {
      existing[result.status]++
      existing.totalDuration += result.duration
    } else {
      acc.push({
        date,
        passed: result.status === 'passed' ? 1 : 0,
        failed: result.status === 'failed' ? 1 : 0,
        skipped: result.status === 'skipped' ? 1 : 0,
        totalDuration: result.duration,
      })
    }

    return acc
  }, [])

  // Complex calculation: Find top 10 slowest tests
  const slowestTests = results
    .filter((result) => result.status !== 'skipped')
    .sort((a, b) => b.duration - a.duration)
    .slice(0, 10)

  // Complex calculation: Calculate statistics per branch
  const branchStats = results.reduce(
    (
      acc: Record<
        string,
        { total: number; failed: number; avgDuration: number }
      >,
      result
    ) => {
      if (!acc[result.branch]) {
        acc[result.branch] = { total: 0, failed: 0, avgDuration: 0 }
      }
      acc[result.branch].total++
      if (result.status === 'failed') {
        acc[result.branch].failed++
      }
      acc[result.branch].avgDuration =
        (acc[result.branch].avgDuration * (acc[result.branch].total - 1) +
          result.duration) /
        acc[result.branch].total
      return acc
    },
    {}
  )

  // Complex calculation: Calculate flakiness score for each test
  const flakinessScores = results.reduce(
    (acc: Record<string, number>, result) => {
      if (!acc[result.name]) {
        acc[result.name] = 0
      }
      // Count status changes as flakiness indicator
      const testResults = results.filter((r) => r.name === result.name)
      let statusChanges = 0
      for (let i = 1; i < testResults.length; i++) {
        if (testResults[i].status !== testResults[i - 1].status) {
          statusChanges++
        }
      }
      acc[result.name] = (statusChanges / testResults.length) * 100
      return acc
    },
    {}
  )

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
                {(point.totalDuration / 1000).toFixed(2)}s
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
                {(test.duration / 1000).toFixed(2)}s
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
                <div>Avg: {stats.avgDuration.toFixed(0)}ms</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default TestResultsChart
