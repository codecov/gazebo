import { format } from 'date-fns'
import PropTypes from 'prop-types'
import { useState } from 'react'
import { useDebounce, useWindowSize } from 'react-use'
import {
  VictoryAccessibleGroup,
  VictoryAxis,
  VictoryChart,
  VictoryLine,
  VictoryTooltip,
  VictoryVoronoiContainer,
} from 'victory'

import { useOrgCoverage } from 'services/charts'

import './chart.css'
import { chartQuery } from './utils'

const tailwindResponsive = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
}

const defaultStyles = {
  tooltip: {
    style: { fontSize: 7 },
    flyout: { top: 5, bottom: 6, left: 7, right: 7 },
  },
  chartPadding: {
    top: 10,
    bottom: 50,
    left: 30,
    right: 10,
  },
  axisLabels: { fontSize: 7 },
}
function Chart({ provider, owner, params }) {
  const {
    data: { coverage: chartData },
  } = useOrgCoverage({
    provider,
    owner,
    query: chartQuery(params),
  })
  const [styles, setStyles] = useState(defaultStyles)
  const { width } = useWindowSize()
  const [,] = useDebounce(
    () => {
      setStyles({
        tooltip: {
          style: { fontSize: 15 },
          flyout: { top: 10, bottom: 10, left: 15, right: 15 },
        },
        chartPadding: {
          top: 10,
          bottom: 85,
          left: 60,
          right: 0,
        },
        axisLabels: { fontSize: 15 },
      })
      if (width >= tailwindResponsive.md) {
        setStyles(defaultStyles)
      }
    },
    2000,
    [width]
  )
  const formatDate = (d) => format(new Date(d), 'MMM d, yyyy')

  function makeTitle(first, last) {
    const firstDateFormatted = formatDate(first.date)
    const lastDateFormatted = formatDate(last.date)
    const coverageDiff = Math.abs(first.coverage, last.coverage)
    const change = first.coverage < last.coverage ? '+' : '-'

    return `Organization wide coverage chart from ${firstDateFormatted} to ${lastDateFormatted}, coverage change is ${change}${coverageDiff}%`
  }

  if (chartData.length < 2) {
    return null
  }

  return (
    <VictoryChart
      width={500}
      height={220}
      yDomain={[0, 100]}
      scale={{ x: 'time', y: 'linear' }}
      // Custom padding tightens the whitespace around the chart.
      padding={styles.chartPadding}
      containerComponent={
        // Veronoi is a algorythem that defines invisible mouse hover regions for data points.
        // For line charts this is a better tooltip then using a normal hover target
        // which is hard/tiny to hit.
        // Refrence: https://en.wikipedia.org/wiki/Voronoi_diagram
        <VictoryVoronoiContainer
          title="Organization wide coverage chart"
          // TODO make a human readable sentance with the min max dates, erpos and change in coverage.
          desc={makeTitle(chartData[0], chartData[chartData.length - 1])}
          voronoiDimension="x"
          labels={({ datum }) =>
            `Coverage: ${Math.floor(datum.coverage, 2)}%  ${formatDate(
              datum.date
            )}`
          }
          labelComponent={
            <VictoryTooltip
              groupComponent={
                <VictoryAccessibleGroup
                  className="chart-tooltip"
                  aria-label="coverage tooltip"
                />
              }
              flyoutPadding={styles.tooltip.flyout}
              style={styles.tooltip.style}
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
        labelPlacement="vertical"
        tickFormat={(t) => formatDate(t)}
        fixLabelOverlap={true}
        style={{
          tickLabels: {
            angle: -45,
            ...styles.axisLabels,
          },
        }}
      />
      <VictoryAxis
        // Coverage (y)
        groupComponent={
          <VictoryAccessibleGroup
            className="coverage-axis"
            aria-label="coverage axis"
          />
        }
        dependentAxis
        domain={[0, 100]}
        tickFormat={(t) => `${t}%`}
        style={{
          tickLabels: styles.axisLabels,
        }}
      />
      <VictoryLine
        groupComponent={
          <VictoryAccessibleGroup
            className="coverage-line"
            aria-label="coverage line"
          />
        }
        x="date"
        y="coverage"
        data={chartData}
      />
    </VictoryChart>
  )
}

Chart.propTypes = {
  provider: PropTypes.string.isRequired,
  owner: PropTypes.string.isRequired,
  params: PropTypes.shape({
    startDate: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
    endDate: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
    repositories: PropTypes.array,
  }),
}

export default Chart
