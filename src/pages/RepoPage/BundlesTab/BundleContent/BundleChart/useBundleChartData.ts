import { useMemo, useRef } from 'react'

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
  const maxSize = useRef(0)
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
      : ['JAVASCRIPT_SIZE', 'STYLESHEET_SIZE', 'FONT_SIZE', 'IMAGE_SIZE']

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
    const mergedDataMap = new Map<string, { [key: string]: number }>()
    // loop through the trend data for various asset types
    for (const x of trendData ?? []) {
      // create data object for the current timestamp
      const data = {
        JAVASCRIPT_SIZE: 0,
        STYLESHEET_SIZE: 0,
        FONT_SIZE: 0,
        IMAGE_SIZE: 0,
      }

      let prevSize = 0
      // loop through the measurements for the current asset type
      for (const y of x.measurements ?? []) {
        const size = y.avg ?? prevSize
        const presentEntry = mergedDataMap.get(y.timestamp)

        if (size > maxSize.current) {
          maxSize.current = size
        }

        if (prevSize !== size) {
          prevSize = size
        }

        // if the current asset type is already present in the map, add the size to the existing value
        if (presentEntry) {
          mergedDataMap.set(y.timestamp, {
            ...presentEntry,
            // @ts-expect-error - it doesn't like the dynamic key but we're guarding ourselves with the conditional above
            [x.assetType]: presentEntry[x.assetType] + size,
          })
        } else {
          mergedDataMap.set(y.timestamp, {
            ...data,
            [x.assetType]: size,
          })
        }
      }
    }

    // take the merged data and convert it into an array of objects
    return Array.from(mergedDataMap).map(([timestamp, avg]) => ({
      date: new Date(timestamp),
      ...avg,
    }))
  }, [trendData])

  const multiplier = findBundleMultiplier(maxSize.current)
  // calculate the y-axis max value based on the max size
  // basically 2 + the next 10^x number
  // examples:
  // - maxSize = 1000, maxY = 2
  // - maxSize = 1499, maxY = 2
  // - maxSize = 1500, maxY = 4
  const maxY =
    2 *
    Math.round(
      (10 ** (Math.floor(maxSize.current).toString().length - 1) +
        maxSize.current +
        multiplier / 2) /
        multiplier /
        2
    )

  return {
    maxY,
    isLoading,
    multiplier,
    data: mergedData,
    assetTypes,
  }
}
