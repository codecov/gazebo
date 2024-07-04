import { differenceInCalendarDays, sub } from 'date-fns'
import { useMemo } from 'react'

import { useBundleTrendData } from 'services/bundleAnalysis'
import { useLocationParams } from 'services/navigation'
import { useRepoOverview } from 'services/repo'
import { findBundleMultiplier } from 'shared/utils/bundleAnalysis'
import { TimeseriesInterval, Trend } from 'shared/utils/timeseriesCharts'

const DAY_THRESHOLD = 90
const MONTH_THRESHOLD = 180

type TimeseriesIntervals =
  (typeof TimeseriesInterval)[keyof typeof TimeseriesInterval]

type Trends = (typeof Trend)[keyof typeof Trend]

interface CreateQueryVarsArgs {
  today: Date
  trend: Trends
  oldestCommitAt: string | null
}

// only exporting for testing purposes
export function createQueryVars({
  today,
  trend,
  oldestCommitAt,
}: CreateQueryVarsArgs) {
  let after = today
  let dayDiff = -Infinity

  if (trend === Trend.SEVEN_DAYS) {
    after = sub(today, { days: 7 })
    dayDiff = differenceInCalendarDays(today, after)
  } else if (trend === Trend.THIRTY_DAYS) {
    after = sub(today, { days: 30 })
    dayDiff = differenceInCalendarDays(today, after)
  } else if (trend === Trend.THREE_MONTHS) {
    after = sub(today, { months: 3 })
    dayDiff = differenceInCalendarDays(today, after)
  } else if (trend === Trend.SIX_MONTHS) {
    after = sub(today, { months: 6 })
    dayDiff = differenceInCalendarDays(today, after)
  } else if (trend === Trend.TWELVE_MONTHS) {
    after = sub(today, { months: 12 })
    dayDiff = differenceInCalendarDays(today, after)
  } else if (trend === Trend.ALL_TIME) {
    after = oldestCommitAt ? new Date(oldestCommitAt) : new Date('1970-01-01')
    dayDiff = differenceInCalendarDays(today, after)
  }

  let interval: TimeseriesIntervals = TimeseriesInterval.INTERVAL_7_DAY
  if (dayDiff < DAY_THRESHOLD) {
    interval = TimeseriesInterval.INTERVAL_1_DAY
  } else if (dayDiff > MONTH_THRESHOLD) {
    interval = TimeseriesInterval.INTERVAL_30_DAY
  }

  return {
    interval,
    after: after,
  }
}

interface UseBundleChartArgs {
  provider: string
  owner: string
  repo: string
  branch: string
  bundle: string
}

export function useBundleChartData({
  provider,
  owner,
  repo,
  branch,
  bundle,
}: UseBundleChartArgs) {
  const { params } = useLocationParams()
  const { data: overview } = useRepoOverview({ provider, owner, repo })

  // @ts-expect-error - useLocationParams needs fixing
  const trend = params?.trend ?? Trend.THREE_MONTHS
  const today = useMemo(() => new Date(), [])

  const queryVars = useMemo(
    () =>
      createQueryVars({
        today,
        trend,
        oldestCommitAt: overview?.oldestCommitAt ?? null,
      }),
    [overview?.oldestCommitAt, today, trend]
  )

  const { data: trendData, isLoading } = useBundleTrendData({
    provider,
    owner,
    repo,
    branch,
    bundle,
    interval: queryVars.interval,
    after: queryVars.after,
    before: today,
    // this will be replaced once we have filtering by types implemented
    filters: {
      assetTypes: ['REPORT_SIZE'],
    },
    enabled: !!overview?.oldestCommitAt,
    suspense: false,
  })

  const mergedData = useMemo(() => {
    // merge the data from all the measurements into a single data point
    // this will be required when we are able to filter by multiple asset types
    // and we want to be able to merge their sizes into a single data point
    // using a map for this because it's efficient for setting and getting values
    const mergedDataMap = new Map<string, number>()
    for (const x of trendData ?? []) {
      let prevSize = 0
      for (const y of x.measurements ?? []) {
        const size = y.avg ?? prevSize
        const presentEntry = mergedDataMap.get(y.timestamp)

        if (prevSize !== size) {
          prevSize = size
        }

        if (presentEntry) {
          mergedDataMap.set(y.timestamp, presentEntry + size)
        } else {
          mergedDataMap.set(y.timestamp, size)
        }
      }
    }

    // take the merged data and convert it into an array of objects
    return Array.from(mergedDataMap).map(([timestamp, avg]) => ({
      date: new Date(timestamp),
      size: avg,
    }))
  }, [trendData])

  // find the max size to calculate the y-axis max value
  let maxSize = 0
  mergedData.forEach((x) => {
    if (x.size > maxSize) {
      maxSize = x.size
    }
  })
  const multiplier = findBundleMultiplier(maxSize)

  // calculate the y-axis max value based on the max size
  // basically 2 + the next 10^x number, eg maxSize = 1000, maxY = 2
  const maxY =
    2 *
    Math.ceil(
      (10 ** (Math.floor(maxSize).toString().length - 1) + maxSize) /
        multiplier /
        2
    )

  return {
    maxY,
    isLoading,
    multiplier,
    data: mergedData,
  }
}
