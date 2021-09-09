import PropTypes from 'prop-types'
import {
  VictoryChart,
  VictoryLine,
  VictoryAxis,
  VictoryVoronoiContainer,
  VictoryTooltip,
  VictoryAccessibleGroup,
} from 'victory'
import { format } from 'date-fns'

import './chart.css'

function Chart({ data = [] }) {
  const formatDate = (d) => format(new Date(d), 'MMM d, yyyy')
  const formatDateShort = (d) => format(new Date(d), 'MMM d, yy')

  function makeTitle(first, last) {
    const firstDateFormatted = formatDate(first.date)
    const lastDateFormatted = formatDate(last.date)
    const coverageDiff = Math.abs(first.coverage, last.coverage)
    const change = first.coverage < last.coverage ? '+' : '-'

    return `Organization wide coverage chart from ${firstDateFormatted} to ${lastDateFormatted}, coverage change is ${change}${coverageDiff}%`
  }

  if (data.length < 2) {
    // TODO: Display something informative when there isn't anything to show
    return null
  }

  return (
    <VictoryChart
      width={768}
      height={250}
      yDomain={[0, 100]}
      scale={{ x: 'time', y: 'linear' }}
      // Custom padding tightens the whitespace around the chart.
      padding={{
        top: 20,
        bottom: 80,
        left: 52,
        right: 0,
      }}
      containerComponent={
        // Veronoi is a algorythem that defines invisible mouse hover regions for data points.
        // For line charts this is a better tooltip then using a normal hover target
        // which is hard/tiny to hit.
        // Refrence: https://en.wikipedia.org/wiki/Voronoi_diagram
        <VictoryVoronoiContainer
          title="Organization wide coverage chart"
          // TODO make a human readable sentance with the min max dates, erpos and change in coverage.
          desc={makeTitle(data[0], data[data.length - 1])}
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
        tickFormat={(t) => formatDateShort(t)}
        fixLabelOverlap={true}
        style={{
          tickLabels: {
            angle: -45,
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
        data={data}
      />
    </VictoryChart>
  )
}

Chart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({ date: PropTypes.date, coverage: PropTypes.number })
  ),
}

export default Chart
