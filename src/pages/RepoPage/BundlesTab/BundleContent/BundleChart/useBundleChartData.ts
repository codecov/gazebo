import { useMemo } from 'react'

import { useBundleTrendData } from 'services/bundleAnalysis'
import { BUNDLE_TREND_REPORT_TYPES } from 'services/bundleAnalysis/useBundleTrendData'
import { useLocationParams } from 'services/navigation'
import { useRepoOverview } from 'services/repo'
import { findBundleMultiplier } from 'shared/utils/bundleAnalysis'
import { createTimeSeriesQueryVars, Trend } from 'shared/utils/timeseriesCharts'

import { BundleReportTypeEnums, findBundleReportAssetEnum } from '../constants'

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

  const queryVars = useMemo(() => {
    const oldestCommit = overview?.oldestCommitAt
      ? new Date(overview.oldestCommitAt)
      : null
    const vars = createTimeSeriesQueryVars({
      today,
      trend,
      oldestCommit,
    })

    return {
      ...vars,
      after: vars.after ?? oldestCommit,
    }
  }, [overview?.oldestCommitAt, today, trend])

  // @ts-expect-error - useLocationParams needs fixing
  const types: BundleReportTypeEnums[] = params?.types ?? []

  // temp removing while we don't have filtering by types implemented
  // const loadTypes = params?.loading ?? []

  const assetTypes: Array<(typeof BUNDLE_TREND_REPORT_TYPES)[number]> =
    types.length > 0
      ? types.map((type) => findBundleReportAssetEnum(type))
      : ['REPORT_SIZE']

  const { data: trendData, isLoading } = useBundleTrendData({
    provider,
    owner,
    repo,
    branch,
    bundle,
    interval: queryVars.interval,
    after: queryVars.after,
    before: queryVars.before,
    // this will be replaced once we have filtering by types implemented
    filters: {
      assetTypes: assetTypes,
      // temp removing while we don't have filtering by types implemented
      // loadTypes: loadTypes,
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
  // basically 2 + the next 10^x number
  // examples:
  // - maxSize = 1000, maxY = 2
  // - maxSize = 1499, maxY = 2
  // - maxSize = 1500, maxY = 4
  const maxY =
    2 *
    Math.round(
      (10 ** (Math.floor(maxSize).toString().length - 1) +
        maxSize +
        multiplier / 2) /
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
