import { extent } from 'd3-array'
import { scaleLinear } from 'd3-scale'
import isFinite from 'lodash/isFinite'
import uniqueId from 'lodash/uniqueId'
import PropTypes from 'prop-types'
import { useMemo } from 'react'

import './sparkline.css'

const HORIZONTAL_PADDING = 10
const FALLBACK_LINE_POS = 0.5 // Value between 0-1

const Sparkline = ({
  datum,
  description,
  dataTemplate,
  select = (data) => data,
  lineSize = 1,
}) => {
  const data = useMemo(
    () =>
      datum.reduce((prev, curr, index) => {
        const nextEntry = datum[index + 1]
        const previousPoint = prev[prev.length - 1]

        return [
          ...prev,
          {
            /* 
              Save the data points original selected value 
            */
            value: select(curr),
            /* 
              Start is the value or the previous end point to connect
              a line when no data is present.
              Used to draw a line from point a to b
            */
            start: select(curr) ? select(curr) : previousPoint?.end,
            /* 
              End is the next entire's value.
              Used to draw a line from point a to b
            */
            end: select(nextEntry),
            /* 
              Sets the rendering mode of the line.
            */
            mode: !isFinite(select(curr)) ? 'empty' : 'normal',
          },
        ]
      }, []),
    [datum, select]
  )
  const [lowerDomain, upperDomain] = extent(data.map(({ value }) => value))
  const yPadding = upperDomain / HORIZONTAL_PADDING
  const yScale = scaleLinear()
    .domain([lowerDomain - yPadding, upperDomain + yPadding])
    .range([0, 1])

  const tableCssProperties = {
    '--line-width': `${lineSize}px`,
  }

  return (
    <table style={tableCssProperties} className="flex flex-1">
      <caption className="sr-only">{description}</caption>
      <tbody className="flex flex-1 flex-row">
        {data.map(({ start, end, mode, value }) => {
          // Inline styles are not performant but because this is memoized it should be ok.
          const properties = {
            '--start': start ? yScale(start).toFixed(2) : FALLBACK_LINE_POS,
            '--size': end ? yScale(end).toFixed(2) : FALLBACK_LINE_POS,
          }
          return (
            <tr
              className="relative flex flex-1 flex-row justify-start"
              key={uniqueId(dataTemplate + description)}
            >
              <td
                className="line absolute inset-0 flex flex-1 p-0 before:absolute before:inset-0 before:bg-ds-pink before:content-[''] after:absolute after:inset-0 after:bg-gradient-to-b after:from-ds-pink after:to-white after:content-['']"
                style={properties}
                data-mode={mode}
              >
                <span className="sr-only">{dataTemplate(value)}</span>
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

Sparkline.propTypes = {
  datum: PropTypes.array,
  select: PropTypes.func,
  description: PropTypes.string.isRequired,
  dataTemplate: PropTypes.func.isRequired,
  lineSize: PropTypes.number,
}

export default Sparkline
