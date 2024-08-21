import { format } from 'date-fns'
import { memo } from 'react'
import {
  createContainer,
  VictoryAccessibleGroup,
  VictoryArea,
  VictoryAxis,
  VictoryChart,
  VictoryClipContainer,
  VictoryTooltip,
} from 'victory'

import { formatSizeToString } from 'shared/utils/bundleAnalysis'

import './chart.css'
import NoBundleData from './NoBundleData'

const defaultStyles = {
  tooltip: {
    style: { fontSize: 4 },
    flyout: { top: 4, bottom: 3, left: 5, right: 5 },
  },
  chartPadding: {
    top: 2,
    bottom: 10,
    left: 0,
    right: 15,
  },
  bundleAxisLabels: {
    fontSize: 4,
    padding: 1,
    fill: 'rgb(var(--color-app-text-secondary))',
  },
  dateAxisLabels: {
    fontSize: 4,
    padding: 0,
    fill: 'rgb(var(--color-app-text-secondary))',
  },
}

// @ts-expect-error - This function wants two args, however we have only ever provided it one, see CoverageAreaChart.
const VictoryVoronoiContainer = createContainer('voronoi')

interface BundleTrendChartProps {
  /**
   * Title of the chart
   * @example `${bundle} size chart`
   */
  title: string

  /**
   * Description of the chart
   * @example
   * ```typescript
   * function makeDesc({ first, last, repo, data }) {
   *  if (!data || !first || !last) return ''
   *    const firstDate = format(new Date(first.date), 'MMM dd, yyy')
   *    const lastDate = format(new Date(last.date), 'MMM dd, yyy')
   *    const sizeDiff = Math.abs(first.size, last.size)
   *    const change = first.size < last.size ? '+' : '-'

   *    return `${repo} size chart from ${firstDate} to ${lastDate}, size change is ${change}${sizeDiff}%`
   *  }
   *  ```
   */
  desc: string

  /**
   * Data for the chart
   * @param maxY - Maximum Y value
   * @param multiplier - Multiplier for the Y axis
   * @param measurements - Array of measurements
   * @example
   * ```typescript
   * const data = {
   *   maxY: 10,
   *   multiplier: 1,
   *   measurements: [
   *     { date: new Date('2021-01-01'), size: 1 },
   *   ]
   * }
   * ```
   */
  data: {
    maxY: number
    multiplier: number
    measurements: { date: Date; size: number }[]
  }
}

export const BundleTrendChart = memo(function ({
  title,
  desc,
  data,
}: BundleTrendChartProps) {
  return (
    <>
      <svg data-testid="bundle-trend-chart" style={{ height: 0 }}>
        <defs>
          <filter
            id="toLinearRGB"
            filterUnits="objectBoundingBox"
            x="0"
            y="0"
            width="1"
            height="1"
          >
            <feComponentTransfer colorInterpolationFilters="sRGB">
              <feFuncR
                type="gamma"
                amplitude="1"
                exponent="0.454545454545"
                offset="0"
              />
              <feFuncG
                type="gamma"
                amplitude="1"
                exponent="0.454545454545"
                offset="0"
              />
              <feFuncB
                type="gamma"
                amplitude="1"
                exponent="0.454545454545"
                offset="0"
              />
              <feFuncA
                type="gamma"
                amplitude="1"
                exponent="0.454545454545"
                offset="0"
              />
            </feComponentTransfer>
          </filter>
        </defs>
      </svg>
      <VictoryChart
        width={340}
        height={80}
        domain={{ y: [0, data.maxY] }}
        scale={{ x: 'time', y: 'linear' }}
        singleQuadrantDomainPadding={{ x: false }}
        // Custom padding tightens the whitespace around the chart.
        padding={defaultStyles.chartPadding}
        containerComponent={
          // Voronoi is a algorithm that defines invisible mouse hover regions for data points.
          // For line charts this is a better tooltip then using a normal hover target
          // which is hard/tiny to hit.
          // Reference: https://en.wikipedia.org/wiki/Voronoi_diagram
          // @ts-expect-error - VictoryVoronoiContainer is not typed as JSX ... but it really is.
          <VictoryVoronoiContainer
            className="bundleTrendChart"
            title={title}
            desc={desc}
            voronoiDimension="x"
            /* labels not testable. */
            labels={({ datum }: any) => `Size: ${formatSizeToString(
              datum.size * data.multiplier
            )}
                ${format(new Date(datum.date), 'MMM dd, yyy')}`}
            labelComponent={
              <VictoryTooltip
                groupComponent={
                  <VictoryAccessibleGroup
                    className="chart-tooltip"
                    aria-label="size tooltip"
                  />
                }
                flyoutPadding={defaultStyles.tooltip.flyout}
                style={defaultStyles.tooltip.style}
                constrainToVisibleArea
                cornerRadius={0}
                pointerLength={0}
              />
            }
          />
        }
      >
        <NoBundleData dataPointCount={data?.measurements.length} />
        <VictoryAxis
          // Dates (x)
          orientation="bottom"
          domainPadding={{ x: [10, 10] }}
          groupComponent={
            <VictoryAccessibleGroup
              className="date-axis"
              aria-label="date axis"
            />
          }
          tickFormat={(t: Date) => format(t, 'MMM dd')}
          style={{
            tickLabels: defaultStyles.dateAxisLabels,
            axis: { stroke: 'transparent', strokeWidth: 0 },
          }}
        />
        <VictoryAxis
          // Bundle size (y)
          orientation="right"
          groupComponent={
            <VictoryAccessibleGroup
              className="size-axis"
              aria-label="size axis"
            />
          }
          crossAxis={false}
          offsetX={5}
          dependentAxis
          domain={[0, data.measurements.length]}
          tickFormat={(t: number) => formatSizeToString(t * data.multiplier)}
          style={{
            tickLabels: defaultStyles.bundleAxisLabels,
            axis: { stroke: 'transparent', strokeWidth: 0 },
          }}
        />
        <VictoryArea
          animate={{
            onLoad: { duration: 1000 },
          }}
          groupComponent={<VictoryClipContainer />}
          x="date"
          y="size"
          data={data.measurements.map(({ size, date }) => ({
            date,
            size: size / data.multiplier,
          }))}
          style={{
            data: {
              fill: '#0071C220',
              cursor: 'pointer',
              stroke: 'rgb(var(--color-ds-gray-octonary))',
              strokeWidth: '0.25px',
            },
          }}
        />
      </VictoryChart>
    </>
  )
})

BundleTrendChart.displayName = 'BundleTrendChart'
