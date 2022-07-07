import { extent } from 'd3-array'
import { scaleLinear } from 'd3-scale'
import isFinite from 'lodash/isFinite'
import uniqueId from 'lodash/uniqueId'
import PropTypes from 'prop-types'
import { useMemo } from 'react'

import './sparkline.css'

const selectFn = (data) => data

const Sparkline = ({
  datum,
  description,
  datumDescriptor,
  select = selectFn,
}) => {
  const data = useMemo(
    () =>
      datum.reduce((prev, curr, index) => {
        const nextEntry = datum[index + 1]
        const previousPoint = prev[prev.length - 1]

        if (nextEntry?.value === 'undefined') {
          return prev
        }
        return [
          ...prev,
          {
            value: select(curr),
            start: select(curr) ? select(curr) : previousPoint?.end,
            end: select(nextEntry),
            mode: !isFinite(select(curr)) ? 'empty' : 'normal',
          },
        ]
      }, []),
    [datum, select]
  )
  const domain = extent(data.map(({ value }) => value))
  const yScale = scaleLinear().domain(domain).range([0, 1])

  if (!datum) {
    return <p>No Data</p>
  }

  return (
    <table className="flex-1 flex">
      <caption className="sr-only">{description}</caption>
      <tbody className="flex flex-row flex-1">
        {data.map(({ start, end, mode, value }) => {
          const properties = {
            '--start': start ? yScale(start) : 0.5, // Fallback to the center
            '--size': end ? yScale(end) : 0.5, // Fallback to the center
          }
          return (
            <tr
              className="relative flex-1 justify-start flex flex-row"
              key={uniqueId(datumDescriptor + description)}
            >
              <td
                className="line absolute inset-0 flex flex-1 before:content-[''] before:absolute before:inset-0"
                style={properties}
                data-mode={mode}
              >
                <span className="sr-only">
                  {datumDescriptor} {value}%
                </span>
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
  datumDescriptor: PropTypes.string.isRequired,
}

export default Sparkline
