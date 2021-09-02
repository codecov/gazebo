import PropTypes from 'prop-types'
import {
  VictoryChart,
  VictoryLine,
  VictoryAxis,
  VictoryVoronoiContainer,
  VictoryTooltip,
} from 'victory'
import { format } from 'date-fns'

const TailwindFontFamily = 'Poppins, ui-sans-serif, system-ui'

/* 
  Victory uses inline styles (style={}) for charts. While we can disable inline
  styling, for the first itteration I've just extending the default theme
  rather then rolling our own.
*/

function Chart({ data = [] }) {
  const formatDate = (d) => format(new Date(d), 'MMM d, yyyy')
  const formatDateShort = (d) => format(new Date(d), 'MMM do')

  return (
    <VictoryChart
      yDomain={[0, 100]}
      scale={{ x: 'time', y: 'linear' }}
      // Custom padding tightens the whitespace around the chart.
      padding={{
        top: 20,
        bottom: 80,
        left: 45,
        right: 0,
      }}
      containerComponent={
        // Veronoi is a algorythem that defines invisible mouse hover regions for data points.
        // For line charts this is a better tooltip then using a normal hover target
        // which is hard/tiny to hit.
        // Refrence: https://en.wikipedia.org/wiki/Voronoi_diagram
        <VictoryVoronoiContainer
          voronoiDimension="x"
          labels={({ datum }) =>
            `Coverage: ${Math.floor(datum.coverage, 2)}% ${formatDate(
              datum.date
            )}`
          }
          labelComponent={
            <VictoryTooltip
              constrainToVisibleArea
              cornerRadius={0}
              flyoutStyle={{ fill: 'white', fontFamily: TailwindFontFamily }}
            />
          }
        />
      }
    >
      <VictoryAxis
        // Dates (x)
        labelPlacement="vertical"
        tickFormat={(t) => formatDateShort(t)}
        fixLabelOverlap={true}
        style={{
          tickLabels: {
            fontFamily: TailwindFontFamily,
            angle: -45,
            textAnchor: 'end',
          },
        }}
      />
      <VictoryAxis
        // Coverage (y)
        style={{
          tickLabels: {
            fontFamily: TailwindFontFamily,
          },
        }}
        dependentAxis
        domain={[0, 100]}
        tickFormat={(t) => `${t}%`}
      />
      <VictoryLine
        x="date"
        y="coverage"
        style={{
          data: { stroke: '#F01F7A' },
        }}
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
