import { format } from 'date-fns'
import PropTypes from 'prop-types'
import { useParams } from 'react-router-dom'
import {
  createContainer,
  VictoryAccessibleGroup,
  VictoryArea,
  VictoryAxis,
  VictoryChart,
  VictoryClipContainer,
  VictoryGroup,
  VictoryTooltip,
} from 'victory'

import { useRepoOverview } from 'services/repo'

import { useBranchSelector, useRepoCoverageTimeseries } from '../hooks'

import './chart.css'

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
  coverageAxisLabels: { fontSize: 4, padding: 1 },
  dateAxisLabels: { fontSize: 4, padding: 0 },
}

const NoData = ({ dataPointCount, ...props }) => {
  return (
    dataPointCount === 1 && (
      <VictoryGroup {...props}>
        <text x="40%" y="45%" fontSize="5">
          Not enough data to render
        </text>
      </VictoryGroup>
    )
  )
}
NoData.propTypes = {
  dataPointCount: PropTypes.number.isRequired,
}

const VictoryZoomVoronoiContainer = createContainer('zoom', 'voronoi')

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
  const { data, isPreviousData, isSuccess } = useRepoCoverageTimeseries(
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
      suspense: false,
      keepPreviousData: true,
    }
  )

  function makeTitle(first, last) {
    const firstDateFormatted = format(new Date(first.date), 'MMM dd, yyy')
    const lastDateFormatted = format(new Date(last.date), 'MMM dd, yyy')
    const coverageDiff = Math.abs(first.coverage, last.coverage)
    const change = first.coverage < last.coverage ? '+' : '-'

    return `${repo} coverage chart from ${firstDateFormatted} to ${lastDateFormatted}, coverage change is ${change}${coverageDiff}%`
  }

  return (
    <>
      <svg style={{ height: 0 }}>
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
          <linearGradient id="myGradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#F01F7A7F" />
            <stop offset="100%" stopColor="white" />
          </linearGradient>
        </defs>
      </svg>
      {(isPreviousData || isSuccess) && (
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
            <VictoryZoomVoronoiContainer
              className="coverageOverTimeChart"
              title={`${repo} coverage chart`}
              desc={makeTitle(
                data?.coverage[0],
                data?.coverage[data?.coverage.length - 1]
              )}
              voronoiDimension="x"
              labels={({ datum }) => `Coverage: ${Math.floor(
                datum.coverage,
                2
              )}%
              ${format(datum.date, 'MMM dd, h:mmaaa, yyy')}`}
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
          <NoData dataPointCount={data?.coverage.length} />
          <VictoryAxis
            // Dates (x)
            domainPadding={{ x: [10, 10] }}
            groupComponent={
              <VictoryAccessibleGroup
                className="date-axis"
                aria-label="date axis"
              />
            }
            tickFormat={data?.coverageAxisLabel}
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
            animate={{
              onLoad: { duration: 1000 },
            }}
            groupComponent={<VictoryClipContainer />}
            x="date"
            y="coverage"
            data={data?.coverage}
            style={{
              data: {
                fill: 'url(#myGradient)',
                filter: 'url(#toLinearRGB)',
                cursor: 'pointer',
                stroke: '#F01F7A',
              },
            }}
          />
        </VictoryChart>
      )}
    </>
  )
}

export default Chart
