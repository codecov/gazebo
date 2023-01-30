import { format } from 'date-fns'
import PropTypes from 'prop-types'
import {
  createContainer,
  VictoryAccessibleGroup,
  VictoryArea,
  VictoryAxis,
  VictoryChart,
  VictoryClipContainer,
  VictoryTooltip,
} from 'victory'

import './chart.css'
import NoData from './NoData'

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

const ColorMap = Object.freeze({
  default: '#222F3D',
  primary: '#21B577',
  warning: '#F4B01B',
  danger: '#F52020',
})

const VictoryVoronoiContainer = createContainer('voronoi')

function Chart({
  data,
  axisLabelFunc,
  desc,
  title,
  renderAreaChart,
  colorVariant = 'default',
}) {
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
            <stop
              offset="0%"
              stopColor={ColorMap[colorVariant]}
              stopOpacity="20%"
            />
            <stop offset="100%" stopColor="white" />
          </linearGradient>
        </defs>
      </svg>
      {renderAreaChart && (
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
              className="coverageAreaChart"
              title={title}
              desc={desc}
              voronoiDimension="x"
              /* labels not testable. */
              labels={({ datum }) => `Coverage: ${Math.floor(
                datum.coverage,
                2
              )}%
                ${format(new Date(datum.date), 'MMM dd, h:mmaaa, yyy')}`}
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
          <NoData dataPointCount={data?.length} />
          <VictoryAxis
            // Dates (x)
            domainPadding={{ x: [10, 10] }}
            groupComponent={
              <VictoryAccessibleGroup
                className="date-axis"
                aria-label="date axis"
              />
            }
            tickFormat={axisLabelFunc}
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
            data={data}
            style={{
              data: {
                fill: 'url(#myGradient)',
                cursor: 'pointer',
                stroke: ColorMap[colorVariant],
                strokeWidth: '0.5px',
              },
            }}
          />
        </VictoryChart>
      )}
    </>
  )
}

Chart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      coverage: PropTypes.number.isRequired,
      date: PropTypes.instanceOf(Date).isRequired,
    }).isRequired
  ),
  axisLabelFunc: PropTypes.func,
  desc: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  renderAreaChart: PropTypes.bool.isRequired,
  colorVariant: PropTypes.oneOf(['black', 'primary', 'warning', 'danger']),
}

export default Chart
