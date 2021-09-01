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

function Chart({ data = [] }) {
  const formatDate = (d) => format(new Date(d), 'do MMM, yyyy')

  return (
    <VictoryChart
      width={768}
      height={300}
      yDomain={[0, 100]}
      scale={{ x: 'time', y: 'linear' }}
      containerComponent={
        <VictoryVoronoiContainer
          voronoiDimension="x"
          labels={({ datum }) =>
            `Coverage: ${datum.coverage}%, ${formatDate(datum.date)}`
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
      <VictoryAxis tickFormat={(t) => ''} />
      <VictoryAxis
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
          parent: { border: '1px solid #ccc' },
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
