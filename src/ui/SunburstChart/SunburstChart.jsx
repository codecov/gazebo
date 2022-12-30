/* eslint-disable max-statements */
import { interpolate } from 'd3-interpolate'
import { scaleSequential } from 'd3-scale'
import { select } from 'd3-selection'
import { arc } from 'd3-shape'
// eslint-disable-next-line no-unused-vars
import { transition } from 'd3-transition' // Kinda odd d3 behavior seems to need to imported but not directly referenced.
import PropTypes from 'prop-types'
import { useEffect, useRef } from 'react'

// Modification of https://observablehq.com/@d3/zoomable-sunburst
import { colorRange, formatData, partitionFn } from './utils'
function SunburstChart({
  data,
  onClick = () => {},
  svgRenderSize = 932,
  svgFontSize = '16px',
}) {
  // DOM node D3 controls
  const ref = useRef()

  // The svg render size. This is *not* equivalent to normal rendering.
  const width = svgRenderSize
  // Overall graph size
  const radius = width / 6

  // In this case D3 is handling rendering not React, so useEffect is used to handle rendering
  // and changes outside of the React lifecycle.
  useEffect(() => {
    // Creates a function for creating arcs representing files and folders.
    const drawArc = arc()
      .startAngle((d) => d.x0)
      .endAngle((d) => d.x1)
      .padAngle((d) => Math.min((d.x1 - d.x0) / 2, 0.005))
      .padRadius(radius * 1.5)
      .innerRadius((d) => d.y0 * radius)
      .outerRadius((d) => Math.max(d.y0 * radius, d.y1 * radius - 1))
    // A color function you can pass a number from 0-100 to and get a color back from the specified color range
    // Ex color(10.4)
    const color = scaleSequential().domain([0, 100]).interpolator(colorRange)

    // Process data for use in D3
    const root = partitionFn(data)
    root.each((d) => (d.current = d))

    // Bind D3 to a DOM element
    const svg = select(ref.current)

    // Creates an animatable group
    const g = svg
      .append('g')
      .attr('transform', `translate(${width / 2},${width / 2})`)

    // Renders an arc per data point in the correct location. (Pieces of the circle that add up to a circular graph)
    const path = g
      .append('g')
      .selectAll('path')
      .data(root.descendants().slice(1))
      .join('path')
      .attr('fill', (d) => color(d.data.value || 0))
      // If data point is a file fade the background color a bit.
      .attr('fill-opacity', (d) =>
        arcVisible(d.current) ? (d.children ? 1 : 0.6) : 0
      )
      .attr('pointer-events', (d) => (arcVisible(d.current) ? 'auto' : 'none'))
      .attr('d', (d) => drawArc(d.current))

    // Click events for folders
    path
      .filter((d) => d.children)
      .style('cursor', 'pointer')
      .on('click', clickedFolder)

    // Click events for folders
    path
      .filter((d) => !d.children)
      .style('cursor', 'pointer')
      .on('click', clickedFile)

    // Create a11y label / mouse hover tooltip
    const formatTitle = (d) =>
      `${d
        .ancestors()
        .map((d) => d.data.name)
        .reverse()
        .join('/')}\n${formatData(d.data.value)}`

    path.append('title').text((d) => formatTitle(d))

    // Render the file/folder name in it's
    const label = g
      .append('g')
      .attr('font-size', svgFontSize)
      .attr('pointer-events', 'none')
      .attr('text-anchor', 'middle')
      .style('user-select', 'none')
      .selectAll('text')
      .data(root.descendants().slice(1))
      .join('text')
      .attr('dy', '0.35em')
      // Hide labels if arc not in view
      .attr('fill-opacity', (d) => +labelVisible(d.current))
      // Apply animation when transitioning in and out.
      .attr('transform', (d) => labelTransform(d.current))
      .text((d) => d.data.name)

    // White circle in the middle. Act's as a "back"
    const parent = g
      .append('circle')
      .datum(root)
      .attr('r', radius)
      .attr('fill', 'none')
      .attr('pointer-events', 'all')
      .on('click', clickedFolder)

    function clickedFolder(_event, p) {
      const filePath = `${p
        .ancestors()
        .map((d) => d.data.name)
        .reverse()
        .join('/')}`

      // callback to react
      onClick(filePath, p.data)

      parent.datum(p.parent || root)

      // Handle animating in/out of a folder
      root.each(
        (d) =>
          (d.target = {
            x0:
              Math.max(0, Math.min(1, (d.x0 - p.x0) / (p.x1 - p.x0))) *
              2 *
              Math.PI,
            x1:
              Math.max(0, Math.min(1, (d.x1 - p.x0) / (p.x1 - p.x0))) *
              2 *
              Math.PI,
            y0: Math.max(0, d.y0 - p.depth),
            y1: Math.max(0, d.y1 - p.depth),
          })
      )

      const t = g.transition().duration(750)

      // Transition the data on all arcs, even the ones that aren’t visible,
      // so that if this transition is interrupted, entering arcs will start
      // the next transition from the desired position.
      path
        .transition(t)
        .tween('data', (d) => {
          const i = interpolate(d.current, d.target)
          return (t) => (d.current = i(t))
        })
        .filter(function (d) {
          return +this.getAttribute('fill-opacity') || arcVisible(d.target)
        })
        .attr('fill-opacity', (d) =>
          arcVisible(d.target) ? (d.children ? 1 : 0.6) : 0
        )
        .attr('pointer-events', (d) => (arcVisible(d.target) ? 'auto' : 'none'))

        .attrTween('d', (d) => () => drawArc(d.current))

      label
        .filter(function (d) {
          return +this.getAttribute('fill-opacity') || labelVisible(d.target)
        })
        .transition(t)
        .attr('fill-opacity', (d) => +labelVisible(d.target))
        .attrTween('transform', (d) => () => labelTransform(d.current))
    }

    function clickedFile(_event, p) {
      const filePath = `${p
        .ancestors()
        .map((d) => d.data.name)
        .reverse()
        .join('/')}`

      // callback to react
      onClick(filePath, p.data)
    }

    // Calculate if a arc is visible
    function arcVisible(d) {
      return d.y1 <= 3 && d.y0 >= 1 && d.x1 > d.x0
    }

    // Calculate if a label is visible
    function labelVisible(d) {
      return d.y1 <= 3 && d.y0 >= 1 && (d.y1 - d.y0) * (d.x1 - d.x0) > 0.03
    }

    // Do the math for a css animation.
    function labelTransform(d) {
      const x = (((d.x0 + d.x1) / 2) * 180) / Math.PI
      const y = ((d.y0 + d.y1) / 2) * radius
      return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`
    }
    // On cleanup remove the root DOM generated by D3
    return () => g.remove()
  }, [data, onClick, radius, svgFontSize, width])
  return <svg viewBox={[0, 0, width, width]} ref={ref} />
}

SunburstChart.propTypes = {
  data: PropTypes.shape({
    name: PropTypes.string.isRequired, // root
    children: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string, // Folder
        value: PropTypes.number, // Coverage
        children: PropTypes.arrayOf(
          PropTypes.oneOfType([
            PropTypes.object, // Another object with children + values. PropTypes doesn't do recursion.
            PropTypes.shape({
              name: PropTypes.string, // FileName
              value: PropTypes.number, // Coverage
            }),
          ])
        ),
      })
    ),
  }),
  onClick: PropTypes.func,
  svgRenderSize: PropTypes.number,
  svgFontSize: PropTypes.string,
}

export default SunburstChart
