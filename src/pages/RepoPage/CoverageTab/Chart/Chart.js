import { format } from 'date-fns'
import { useParams } from 'react-router-dom'
import {
  VictoryAccessibleGroup,
  VictoryArea,
  VictoryAxis,
  VictoryChart,
  VictoryClipContainer,
  VictoryTooltip,
  VictoryVoronoiContainer,
} from 'victory'

import { useRepoOverview } from 'services/repo'

import { useBranchSelector, useRepoCoverageTimeseries } from '../hooks'

import './chart.css'

const defaultStyles = {
  tooltip: {
    style: { fontSize: 5 },
    flyout: { top: 4, bottom: 3, left: 5, right: 5 },
  },
  chartPadding: {
    top: 2,
    bottom: 10,
    left: 0,
    right: 15,
  },
  coverageAxisLabels: { fontSize: 5, padding: 1 },
  dateAxisLabels: { fontSize: 5, padding: 0 },
}
function Chart() {
  const { provider, owner, repo } = useParams()
  const { data: overview } = useRepoOverview({
    provider,
    repo,
    owner,
  })
  const { selection } = useBranchSelector(
    overview?.branches,
    overview?.defaultBranch
  )
  const { coverage, coverageAxisLabel } = useRepoCoverageTimeseries(
    {
      branch: selection?.name,
    },
    {
      enabled: !!selection?.name,
      select: (data) => {
        const coverage = data.coverage.map((coverage) => ({
          ...coverage,
          date: new Date(coverage.date),
        }))
        return { ...data, coverage }
      },
    }
  )

  function makeTitle(first, last) {
    const firstDateFormatted = format(first.date, 'MMM dd, yyy')
    const lastDateFormatted = format(last.date, 'MMM dd, yyy')
    const coverageDiff = Math.abs(first.coverage, last.coverage)
    const change = first.coverage < last.coverage ? '+' : '-'

    return `${repo} coverage chart from ${firstDateFormatted} to ${lastDateFormatted}, coverage change is ${change}${coverageDiff}%`
  }

  if (coverage.length < 2) {
    return null
  }

  return (
    <>
      <svg style={{ height: 0 }}>
        <defs>
          <linearGradient id="myGradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#F01F7A66" />
            <stop offset="100%" stopColor="white" />
          </linearGradient>
        </defs>
      </svg>
      <VictoryChart
        width={400}
        height={69}
        yDomain={[0, 100]}
        scale={{ x: 'time', y: 'linear' }}
        singleQuadrantDomainPadding={{ x: false }}
        // Custom padding tightens the whitespace around the chart.
        padding={defaultStyles.chartPadding}
        containerComponent={
          // Veronoi is a algorithm that defines invisible mouse hover regions for data points.
          // For line charts this is a better tooltip then using a normal hover target
          // which is hard/tiny to hit.
          // Reference: https://en.wikipedia.org/wiki/Voronoi_diagram
          <VictoryVoronoiContainer
            title={`${repo} coverage chart`}
            desc={makeTitle(coverage[0], coverage[coverage.length - 1])}
            voronoiDimension="x"
            labels={({ datum }) =>
              `Coverage: ${Math.floor(datum.coverage, 2)}%
              ${format(datum.date, 'MMM dd, h:mmaaa, yyy')}`
            }
            labelComponent={
              <VictoryTooltip
                groupComponent={
                  <VictoryAccessibleGroup
                    className="chart-tooltip"
                    aria-label="coverage tooltip"
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
        <VictoryAxis
          // Dates (x)
          groupComponent={
            <VictoryAccessibleGroup
              className="date-axis"
              aria-label="date axis"
            />
          }
          tickFormat={coverageAxisLabel}
          style={{
            tickLabels: defaultStyles.dateAxisLabels,
            axis: { stroke: 'transparent', strokeWidth: 0 },
          }}
        />
        <VictoryAxis
          // Coverage (y)
          orientation="right"
          groupComponent={
            <VictoryAccessibleGroup
              className="coverage-axis"
              aria-label="coverage axis"
            />
          }
          crossAxis={false}
          offsetX={5}
          dependentAxis
          domain={[0, 100]}
          tickFormat={(t) => `${t}%`}
          style={{
            tickLabels: defaultStyles.coverageAxisLabels,
            axis: { stroke: 'transparent', strokeWidth: 0 },
          }}
        />
        <VictoryArea
          groupComponent={<VictoryClipContainer />}
          x="date"
          y="coverage"
          data={coverage}
          style={{
            data: {
              fill: 'url(#myGradient)',
              cursor: 'pointer',
              stroke: '#F01F7A',
            },
          }}
        />
      </VictoryChart>
    </>
  )
}

export default Chart
