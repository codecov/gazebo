import { extent } from 'd3-array'
import { scaleLinear } from 'd3-scale'
import isFinite from 'lodash/isFinite'
import uniqueId from 'lodash/uniqueId'
import { useMemo } from 'react'

import './sparkline.css'

const HORIZONTAL_PADDING = 10
const FALLBACK_LINE_POS = 0.5 // Value between 0-1
type NumberOrNullOrUndefined = number | null | undefined

interface SparklineData {
  value: NumberOrNullOrUndefined
  start: NumberOrNullOrUndefined
  end: NumberOrNullOrUndefined
  mode: 'empty' | 'normal'
}

export interface SparklineProps {
  datum: any[]
  description: string
  dataTemplate: (value: NumberOrNullOrUndefined) => string
  select?: (data: any) => NumberOrNullOrUndefined
  lineSize?: number
  // allows overriding the FALLBACK_LINE_POS value
  lineFallBack?: number
  // this tapers the sparkline to the fallback line y-axis value which doesn't
  // work in all cases, so this lets you override the value
  taperEndPoint?: boolean
}

const Sparkline: React.FC<SparklineProps> = ({
  datum,
  description,
  dataTemplate,
  select = (data) => data,
  lineSize = 1,
  lineFallBack = FALLBACK_LINE_POS,
  taperEndPoint = true,
}) => {
  const data: SparklineData[] = useMemo(
    () =>
      datum.reduce<SparklineData[]>((prev, curr, index) => {
        const nextEntry = datum[index + 1]
        const previousPoint = prev[prev.length - 1]
        return [
          ...prev,
          {
            /* 
              Save the data point's original selected value 
            */
            value: select(curr),
            /* 
              Start is the value or the previous end point to connect
              a line when no data is present.
              Used to draw a line from point a to b
            */
            start: select(curr) ? select(curr) : previousPoint?.end,
            /* 
              End is the next entry's value.
              Used to draw a line from point a to b.
            */
            end: nextEntry
              ? select(nextEntry)
              : taperEndPoint
                ? nextEntry
                : previousPoint?.end,
            /* 
              Sets the rendering mode of the line.
            */
            mode: !isFinite(select(curr)) ? 'empty' : 'normal',
          },
        ]
      }, []),
    [datum, select, taperEndPoint]
  )

  let yPadding
  let yScale: (num: number) => number = (num) => num
  const numericData = data
    .map(({ value }) => value)
    .filter((val) => typeof val === 'number') as number[]
  const [lowerDomain, upperDomain] = extent(numericData)

  if (upperDomain && lowerDomain) {
    yPadding = upperDomain / HORIZONTAL_PADDING
    yScale = scaleLinear()
      .domain([lowerDomain - yPadding, upperDomain + yPadding])
      .range([0, 1])
  }

  interface TableCustomCSSProperties extends React.CSSProperties {
    '--line-width': string
    '--start': string
    '--size': string
  }

  const tableCssProperties = {
    '--line-width': `${lineSize}px`,
  }

  return (
    <table
      id="sparklineTable"
      style={tableCssProperties as TableCustomCSSProperties}
      className="flex flex-1"
    >
      <caption className="sr-only">{description}</caption>
      <tbody className="flex flex-1 flex-row">
        {data.map(({ start, end, mode, value }, i) => {
          // Inline styles are not performant but because this is memoized it should be ok.
          const properties = {
            '--start': start
              ? yScale(start).toFixed(2)
              : lineFallBack.toString(),
            '--size': end ? yScale(end).toFixed(2) : lineFallBack.toString(),
          }

          return (
            <tr
              className="relative flex flex-1 flex-row justify-start"
              key={uniqueId(dataTemplate + description)}
            >
              <td
                className="line absolute inset-0 flex flex-1 p-0 before:absolute before:inset-0 before:bg-ds-chart-area-stroke before:content-[''] after:absolute after:inset-0 after:bg-ds-blue-darker/10 after:content-['']"
                style={properties as TableCustomCSSProperties}
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

export default Sparkline
