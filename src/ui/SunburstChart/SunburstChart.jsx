import * as Sentry from '@sentry/react'
import { scaleSequential } from 'd3-scale'
import { select } from 'd3-selection'
import { arc } from 'd3-shape'
import PropTypes from 'prop-types'
import { useLayoutEffect, useRef, useState } from 'react'

// Modification of https://observablehq.com/@d3/zoomable-sunburst
import { colorRange, formatData, partitionFn } from './utils'

function SunburstChart({
  data,
  onClick = () => {},
  onHover = () => {},
  selector = ({ value }) => value,
  svgRenderSize = 932,
  colorDomainMin = 0,
  colorDomainMax = 100,
}) {
  // DOM node D3 controls
  const ref = useRef()
  const selectorHandler = useRef(selector)
  const clickHandler = useRef(onClick)
  const hoverHandler = useRef(onHover)

  // this state stores the root node of the sunburst chart
  const [root] = useState(() =>
    Sentry.startSpan({ name: 'SunburstChart.createRoot' }, () => {
      // go through the data and add `value` to each node
      const stack = [data]

      // create a new root node with the value of the root node
      const result = { ...data, value: selectorHandler.current(data) }

      // while there are nodes to process, pop the last node from the stack
      while (stack.length > 0) {
        const node = stack.pop()

        // set the value of the node if not previously set
        if (!('value' in node)) {
          node.value = selectorHandler.current(node)
        }

        // if the node has children, process them
        if (Array.isArray(node.children)) {
          node.children.forEach((child) => stack.push(child))
        }
      }

      // partition the data and add the `current` property to each node
      return partitionFn(result).each((d) => (d.current = d))
    })
  )

  const [selectedNode, setSelectedNode] = useState(root)

  // In this case D3 is handling rendering not React, so useLayoutEffect is used to handle rendering
  // and changes outside of the React lifecycle.
  useLayoutEffect(() => {
    // early return if the ref is not found
    if (!ref.current) return

    // The svg render size. This is *not* equivalent to normal rendering.
    const width = svgRenderSize

    // Overall graph size
    const radius = width / 6

    // Creates a function for creating arcs representing files and folders.
    function createDrawArcFunction(parentSpan) {
      return Sentry.startSpan(
        { name: 'SunburstChart.drawArc', parentSpan },
        () =>
          arc()
            .startAngle((d) => d.x0)
            .endAngle((d) => d.x1)
            .padAngle((d) => Math.min((d.x1 - d.x0) / 2, 0.005))
            .padRadius(radius * 1.5)
            .innerRadius((d) => d.y0 * radius)
            .outerRadius((d) => Math.max(d.y0 * radius, d.y1 * radius - 1))
      )
    }
    // A color function you can pass a number from 0-100 to and get a color back from the specified color range
    // Ex color(10.4)
    function createColorFunction(parentSpan) {
      return Sentry.startSpan({ name: 'SunburstChart.color', parentSpan }, () =>
        scaleSequential()
          .domain([colorDomainMin, colorDomainMax])
          .interpolator(colorRange)
          .clamp(true)
      )
    }

    // Tracks previous location for rendering .. in the breadcrumb.
    let previous

    // Bind D3 to a DOM element
    const svg = select(ref.current)

    // Creates an animatable group
    const g = svg
      .append('g')
      .attr('transform', `translate(${width / 2},${width / 2})`)

    function renderSunburst() {
      Sentry.startSpan(
        { name: 'SunburstChart.renderSunburst' },
        (renderSunburstSpan) => {
          const drawArc = createDrawArcFunction(renderSunburstSpan)
          const color = createColorFunction(renderSunburstSpan)
          const nodesToRender = selectedNode
            .descendants()
            .slice(1)
            .filter((d) => d.depth <= selectedNode.depth + 2)

          // Renders an arc per data point in the correct location. (Pieces of the circle that add up to a circular graph)
          const path = Sentry.startSpan(
            {
              name: 'SunburstChart.renderArcs',
              parentSpan: renderSunburstSpan,
            },
            () =>
              g
                .append('g')
                .selectAll('path')
                .data(nodesToRender)
                .join('path')
                .attr('fill', (d) => color(d?.data?.value || 0))
                // If data point is a file fade the background color a bit.
                .attr('fill-opacity', (d) => (d.children ? 1 : 0.6))
                .attr('pointer-events', () => 'auto')
                .attr('d', (d) => drawArc(d.current))
          )
          // Events for folders
          path
            .filter((d) => d.children)
            .style('cursor', 'pointer')
            .on('click', clickedFolder)
            .on('mouseover', function (_event, p) {
              select(this).attr('fill-opacity', 0.6)
              reactHoverCallback({ target: p, type: 'folder' })
            })
            .on('mouseout', function (_event, _node) {
              select(this).attr('fill-opacity', 1)
            })

          // Events for file
          path
            .filter((d) => !d.children)
            .style('cursor', 'pointer')
            .on('click', function (_event, node) {
              reactClickCallback({ target: node, type: 'file' })
            })
            .on('mouseover', function (_event, node) {
              select(this).attr('fill-opacity', 0.6)
              reactHoverCallback({ target: node, type: 'file' })
            })

          // Create a11y label / mouse hover tooltip
          const formatTitle = (d) => {
            const coverage = formatData(d.data.value)
            const filePath = d
              .ancestors()
              .map((d) => d.data.name)
              .reverse()
              .join('/')

            return `${filePath}\n${coverage}% coverage`
          }

          path.append('title').text((d) => formatTitle(d))

          // White circle in the middle. Act's as a "back"
          g.append('circle')
            .datum(selectedNode.parent)
            .attr('r', radius)
            .attr('class', 'fill-none')
            .attr('fill', 'none')
            .attr('pointer-events', 'all')
            .attr('cursor', (d) => (d ? 'pointer' : 'default'))
            .on('click', clickedFolder)
            .on('mouseover', hoveredRoot)

          g.append('text')
            .datum(selectedNode.parent)
            .text('..')
            // if the parent exists (i.e. not root), show the text
            .attr('fill-opacity', (d) => (d ? 1 : 0))
            .attr('text-anchor', 'middle')
            .attr('class', 'text-7xl fill-ds-gray-quinary select-none')
            .attr('cursor', 'pointer')
            .on('click', clickedFolder)
            .on('mouseover', hoveredRoot)

          function clickedFolder(_event, node) {
            reactClickCallback({ target: node, type: 'folder' })
            changeLocation(node)
          }

          function hoveredRoot(_event, node) {
            if (previous) {
              reactHoverCallback({ target: previous, type: 'folder' })
              return
            }
            reactHoverCallback({ target: node, type: 'folder' })
          }

          function reactClickCallback({ target, type }) {
            if (target?.ancestors) {
              // Create a string from the root data down to the current item
              const filePath = target
                .ancestors()
                .map((d) => d.data.name)
                .slice(0, -1)
                .reverse()
                .join('/')

              // callback to parent component with a path, the data node, and raw d3 data
              // (just in case we need it for the second iteration to listen to location changes and direct to the correct folder.)
              clickHandler.current({
                path: filePath,
                data: target.data,
                target,
                type,
              })
            }
          }

          function reactHoverCallback({ target, type }) {
            if (target?.ancestors) {
              // Create a string from the root data down to the current item
              const filePath = target
                .ancestors()
                .map((d) => d.data.name)
                .slice(0, -1)
                .reverse()
                .join('/')

              // callback to parent component with a path, the data node, and raw d3 data
              // (just in case we need it for the second iteration to listen to location changes and direct to the correct folder.)
              hoverHandler.current({
                path: filePath,
                data: target.data,
                target,
                type,
              })
            }
          }

          function changeLocation(node) {
            Sentry.startSpan(
              {
                name: 'SunburstChart.handleArcsUpdate',
                parentSpan: renderSunburstSpan,
              },
              () => {
                // Because you can move two layers at a time previous !== parent
                previous = node

                if (node) {
                  // Update the selected node
                  setSelectedNode(
                    node.each((d) => {
                      // determine x0 and y0
                      const x0Min = Math.min(
                        1,
                        (d.x0 - node.x0) / (node.x1 - node.x0)
                      )
                      const x0 = Math.max(0, x0Min) * 2 * Math.PI
                      const y0 = Math.max(0, d.y0 - node.depth)

                      // determine x1 and y1
                      const x1Min = Math.min(
                        1,
                        (d.x1 - node.x0) / (node.x1 - node.x0)
                      )
                      const x1 = Math.max(0, x1Min) * 2 * Math.PI
                      const y1 = Math.max(0, d.y1 - node.depth)

                      // update the cords for the node
                      d.current = { x0, y0, x1, y1 }
                    })
                  )
                }
              }
            )
          }
        }
      )
    }

    renderSunburst()

    return () => {
      // On cleanup remove the root DOM generated by D3
      g.remove()
    }
  }, [colorDomainMax, colorDomainMin, selectedNode, svgRenderSize])

  return (
    <svg
      ref={ref}
      data-testid="sunburst"
      viewBox={[0, 0, svgRenderSize, svgRenderSize]}
    />
  )
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
  selector: PropTypes.func,
  onClick: PropTypes.func,
  onHover: PropTypes.func,
  svgRenderSize: PropTypes.number,
  colorDomainMin: PropTypes.number,
  colorDomainMax: PropTypes.number,
}

export default Sentry.withProfiler(SunburstChart, {
  name: 'SunburstChart',
})
