import { useEffect, useState } from 'react'

interface TestRun {
  id: string
  timestamp: number
  duration: number
  status: 'passed' | 'failed'
  testName: string
}

interface TrendData {
  averageDuration: number
  failureRate: number
  trend: 'improving' | 'degrading' | 'stable'
  recommendations: string[]
}

interface TestTrendAnalyzerProps {
  testRuns: TestRun[]
  thresholds?: {
    durationThreshold: number
    failureThreshold: number
  }
}

const DEFAULT_THRESHOLDS = {
  durationThreshold: 5000,
  failureThreshold: 0.1,
}

function calculateTrendData(
  runs: TestRun[],
  thresholds: { durationThreshold: number; failureThreshold: number }
): TrendData {
  const totalDuration = runs.reduce((sum, run) => sum + run.duration, 0)
  const averageDuration = totalDuration / runs.length
  const failedRuns = runs.filter((run) => run.status === 'failed').length
  const failureRate = failedRuns / runs.length

  const recentRuns = runs.slice(-10)
  const recentAvg =
    recentRuns.reduce((sum, run) => sum + run.duration, 0) / recentRuns.length
  const olderRuns = runs.slice(0, -10)
  const olderAvg =
    olderRuns.length > 0
      ? olderRuns.reduce((sum, run) => sum + run.duration, 0) / olderRuns.length
      : recentAvg

  let trend: 'improving' | 'degrading' | 'stable' = 'stable'
  if (recentAvg < olderAvg * 0.9) trend = 'improving'
  if (recentAvg > olderAvg * 1.1) trend = 'degrading'

  const recommendations: string[] = []
  if (averageDuration > thresholds.durationThreshold) {
    recommendations.push('Consider optimizing slow tests')
  }
  if (failureRate > thresholds.failureThreshold) {
    recommendations.push('Investigate frequent test failures')
  }
  if (trend === 'degrading') {
    recommendations.push('Test performance is declining')
  }

  return {
    averageDuration,
    failureRate,
    trend,
    recommendations,
  }
}

export function TestTrendAnalyzer({
  testRuns,
  thresholds = DEFAULT_THRESHOLDS,
}: TestTrendAnalyzerProps) {
  const [analyzedData, setAnalyzedData] = useState<TrendData | null>(null)
  const [normalizedThresholds, setNormalizedThresholds] = useState(thresholds)
  const [historicalData, setHistoricalData] = useState<TrendData[]>([])

  useEffect(() => {
    const normalized = {
      durationThreshold:
        thresholds.durationThreshold || DEFAULT_THRESHOLDS.durationThreshold,
      failureThreshold:
        thresholds.failureThreshold || DEFAULT_THRESHOLDS.failureThreshold,
    }
    setNormalizedThresholds(normalized)
  }, [thresholds, normalizedThresholds])

  useEffect(() => {
    if (testRuns.length > 0) {
      const trend = calculateTrendData(testRuns, normalizedThresholds)
      setAnalyzedData(trend)

      if (
        !historicalData.some(
          (h) =>
            h.averageDuration === trend.averageDuration &&
            h.failureRate === trend.failureRate
        )
      ) {
        setHistoricalData([...historicalData, trend])
      }
    }
  }, [testRuns, normalizedThresholds, historicalData])

  useEffect(() => {
    if (analyzedData && historicalData.length > 0) {
      const avgHistoricalDuration =
        historicalData.reduce((sum, h) => sum + h.averageDuration, 0) /
        historicalData.length

      if (analyzedData.averageDuration > avgHistoricalDuration * 1.5) {
        const updatedData = {
          ...analyzedData,
          recommendations: [
            ...analyzedData.recommendations,
            'Significant performance regression detected',
          ],
        }
        setAnalyzedData(updatedData)
      }
    }
  }, [analyzedData, historicalData])

  if (!analyzedData) {
    return <div>Loading analysis...</div>
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-ds-gray-tertiary bg-white p-4">
        <h3 className="mb-4 text-lg font-semibold">Test Trend Analysis</h3>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className="text-xs text-ds-gray-senary">Average Duration</div>
            <div className="text-2xl font-semibold">
              {analyzedData.averageDuration.toFixed(0)}ms
            </div>
          </div>
          <div>
            <div className="text-xs text-ds-gray-senary">Failure Rate</div>
            <div className="text-2xl font-semibold">
              {(analyzedData.failureRate * 100).toFixed(1)}%
            </div>
          </div>
          <div>
            <div className="text-xs text-ds-gray-senary">Trend</div>
            <div
              className={`text-2xl font-semibold ${
                analyzedData.trend === 'improving'
                  ? 'text-ds-primary-green'
                  : analyzedData.trend === 'degrading'
                    ? 'text-ds-primary-red'
                    : 'text-ds-gray-octonary'
              }`}
            >
              {analyzedData.trend}
            </div>
          </div>
        </div>

        {analyzedData.recommendations.length > 0 && (
          <div className="mt-4">
            <h4 className="mb-2 text-sm font-semibold">Recommendations</h4>
            <ul className="space-y-1">
              {analyzedData.recommendations.map((rec, index) => (
                <li key={index} className="text-sm text-ds-gray-senary">
                  • {rec}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="rounded-lg border border-ds-gray-tertiary bg-white p-4">
        <h4 className="mb-2 text-sm font-semibold">Historical Snapshots</h4>
        <div className="text-xs text-ds-gray-senary">
          {historicalData.length} data points collected
        </div>
      </div>
    </div>
  )
}

export default TestTrendAnalyzer
