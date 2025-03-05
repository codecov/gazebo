import { format } from 'd3-format'
import { hierarchy, partition } from 'd3-hierarchy'
import { interpolateHslLong } from 'd3-interpolate'

// Processes the raw data and before rendering
// http://using-d3js.com/06_04_partitions.html
export const partitionFn = (data) => {
  const root = hierarchy(data)
    .sum((d) => d.value)
    .sort((a, b) => b.value - a.value)
  return partition().size([2 * Math.PI, root.height + 1])(root)
}

export const formatData = format(',d')

// Interpolate in between --color-ds-primary-red, --color-ds-primary-green
export const colorRange = interpolateHslLong(
  'rgb(254, 0, 0)',
  'rgb(33, 181, 119)'
)

// Calculate if an arc is visible
export const arcVisible = (d) => {
  return d.y1 <= 3 && d.y0 >= 1 && d.x1 > d.x0
}
