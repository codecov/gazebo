import * as Sentry from '@sentry/react'
import { interpolate } from 'd3-interpolate'
import { scaleSequential } from 'd3-scale'
import { select } from 'd3-selection'
import { arc } from 'd3-shape'
import { transition } from 'd3-transition' // Kinda odd d3 behavior seems to need to imported but not directly referenced.
import PropTypes from 'prop-types'
import { useLayoutEffect, useRef, useState } from 'react'

// Modification of https://observablehq.com/@d3/zoomable-sunburst
import { arcVisible, colorRange, formatData, partitionFn } from './utils'

function SunburstChart({
  data,
  onClick = () => {},
  onHover = () => {},
  selector = ({ value }) => value,
  svgRenderSize = 932,
  svgFontSize = '16px',
  colorDomainMin = 0,
  colorDomainMax = 100,
}) {
  // DOM node D3 controls
  const ref = useRef()
  const selectorHandler = useRef(selector)
  const clickHandler = useRef(onClick)
  const hoverHandler = useRef(onHover)

  /*
   * I don't think the depthIndex will work, because we're not trying to render a given depth, we're trying to render a folder and all of its children.
   * So we need to render all children of a given folder at once.
   */

  // this state stores the root node of the sunburst chart
  const [{ root, pathIndex }] = useState(() =>
    Sentry.startSpan({ name: 'SunburstChart.createRoot' }, () => {
      // go through the data and add `value` to each node
      const stack = [data]
      const pathIndex = new Map()

      // create a new root node with the value of the root node
      const result = { ...data, value: selectorHandler.current(data) }

      // while there are nodes to process, pop the last node from the stack
      while (stack.length > 0) {
        const node = stack.pop()

        if (!('value' in node)) {
          node.value = selectorHandler.current(node)
        }

        // if the node has children, process them
        if (Array.isArray(node.children)) {
          node.children.forEach((child) => stack.push(child))
        }

        const root = partitionFn(result).each((d) => (d.current = d))

        root.each((d) => {
          const collection = depthIndex.get(d.depth) ?? []
          collection.push(d)
          depthIndex.set(d.depth, collection)
        })

        // partition the data and add the `current` property to each node
        return { root, depthIndex }
      }

      // if the node has children, process them
      if (Array.isArray(node.children)) {
        node.children.forEach((child) => stack.push(child))
      }

      const root = partitionFn(result).each((d) => (d.current = d))

      root.each((d) => {
        // only add to pathIndex if the node has children as it represents a folder
        if (d?.children) {
          pathIndex.set(d.data.fullPath, d)
        }
      })

      // partition the data and add the `current` property to each node
      return { root, pathIndex }
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
    const drawArc = Sentry.startSpan({ name: 'SunburstChart.drawArc' }, () => {
      return arc()
        .startAngle((d) => d.x0)
        .endAngle((d) => d.x1)
        .padAngle((d) => Math.min((d.x1 - d.x0) / 2, 0.005))
        .padRadius(radius * 1.5)
        .innerRadius((d) => d.y0 * radius)
        .outerRadius((d) => Math.max(d.y0 * radius, d.y1 * radius - 1))
    })

    // A color function you can pass a number from 0-100 to and get a color back from the specified color range
    // Ex color(10.4)
    const color = Sentry.startSpan({ name: 'SunburstChart.color' }, () => {
      return scaleSequential()
        .domain([colorDomainMin, colorDomainMax])
        .interpolator(colorRange)
        .clamp(true)
    })

    // Tracks previous location for rendering .. in the breadcrumb.
    let previous

    // Bind D3 to a DOM element
    const svg = select(ref.current)

    // Creates an animatable group
    const g = svg
      .append('g')
      .attr('transform', `translate(${width / 2},${width / 2})`)

    // Renders an arc per data point in the correct location. (Pieces of the circle that add up to a circular graph)
    const path = Sentry.startSpan({ name: 'SunburstChart.renderArcs' }, () =>
      g
        .append('g')
        .selectAll('path')
        .data(root.descendants().slice(1))
        .join('path')
        .attr('fill', (d) => color(d?.data?.value || 0))
        // If data point is a file fade the background color a bit.
        .attr('fill-opacity', (d) =>
          arcVisible(d.current) ? (d.children ? 1 : 0.6) : 0
        )
        .attr('pointer-events', (d) =>
          arcVisible(d.current) ? 'auto' : 'none'
        )
        .attr('d', (d) => drawArc(d.current))
    )

    // Events for folders
    path
      .filter((d) => d.children)
      .style('cursor', 'pointer')
      .on('click', clickedFolder)
      .on('mouseover', hoveredFolder)
      .on('mouseout', mouseout)

    // Events for file
    path
      .filter((d) => !d.children)
      .style('cursor', 'pointer')
      .on('click', clickedFile)
      .on('mouseover', hoveredFile)

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
    const parent = g
      .append('circle')
      .datum(root)
      .attr('r', radius)
      .attr('fill', 'none')
      .attr('pointer-events', 'all')
      .attr('cursor', 'pointer')
      .on('click', clickedFolder)
      .on('mouseover', hoveredRoot)

    const backText = g
      .append('text')
      .datum(root)
      .text('..')
      .attr('fill-opacity', 0)
      .attr('text-anchor', 'middle')
      .attr('class', 'text-7xl fill-ds-gray-quinary')
      .attr('cursor', 'pointer')
      .on('click', clickedFolder)
      .on('mouseover', hoveredRoot)

    function clickedFolder(_event, p) {
      reactClickCallback({ target: p, type: 'folder' })
      changeLocation(p)
    }

    function clickedFile(_event, p) {
      reactClickCallback({ target: p, type: 'file' })
    }

    function hoveredRoot(_event, p) {
      if (previous) {
        reactHoverCallback({ target: previous, type: 'folder' })
        return
      }
      reactHoverCallback({ target: p, type: 'folder' })
    }

    function hoveredFolder(_event, p) {
      select(this).attr('fill-opacity', 0.6)
      reactHoverCallback({ target: p, type: 'folder' })
    }

    function hoveredFile(_event, p) {
      select(this).attr('fill-opacity', 0.6)
      reactHoverCallback({ target: p, type: 'file' })
    }

    function mouseout(_event, _p) {
      select(this).attr('fill-opacity', 1)
    }

    function reactClickCallback({ target, type }) {
      // Create a string from the root data down to the current item
      const filePath = target
        .ancestors()
        .map((d) => d.data.name)
        .slice(0, -1)
        .reverse()
        .join('/')

      // callback to parent component with a path, the data node, and raw d3 data
      // (just in case we need it for the second iteration to listen to location changes and direct to the correct folder.)
      clickHandler.current({ path: filePath, data: target.data, target, type })
    }

    function reactHoverCallback({ target, type }) {
      // Create a string from the root data down to the current item
      const filePath = target
        .ancestors()
        .map((d) => d.data.name)
        .slice(0, -1)
        .reverse()
        .join('/')

      // callback to parent component with a path, the data node, and raw d3 data
      // (just in case we need it for the second iteration to listen to location changes and direct to the correct folder.)
      hoverHandler.current({ path: filePath, data: target.data, target, type })
    }

    function changeLocation(p) {
      // Because you can move two layers at a time previous !== parent
      previous = p
      const selected = p.parent || root
      const t = transition(g).duration(750)

      handleArcsUpdate({ current: p, selected, transition: t })
      handleTextUpdate({ current: p, selected, transition: t })
    }

    const handleArcsUpdate = ({ current, selected, transition }) =>
      Sentry.startSpan({ name: 'SunburstChart.handleArcsUpdate' }, () => {
        parent.datum(selected)

        // Handle animating in/out of a folder
        Sentry.startSpan({ name: 'SunburstChart.calculateCoordinates' }, () => {
          root.each((d) => {
            // determine x0 and y0
            const x0Min = Math.min(
              1,
              (d.x0 - current.x0) / (current.x1 - current.x0)
            )
            const x0 = Math.max(0, x0Min) * 2 * Math.PI
            const y0 = Math.max(0, d.y0 - current.depth)

            // determine x1 and y1
            const x1Min = Math.min(
              1,
              (d.x1 - current.x0) / (current.x1 - current.x0)
            )
            const x1 = Math.max(0, x1Min) * 2 * Math.PI
            const y1 = Math.max(0, d.y1 - current.depth)

            d.target = { x0, y0, x1, y1 }
          })
        })

        // Transition the data on all arcs, even the ones that aren’t visible,
        // so that if this transition is interrupted, entering arcs will start
        // the next transition from the desired position.
        Sentry.startSpan({ name: 'SunburstChart.transitionArcs' }, () => {
          path
            .transition(transition)
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
            .attr('pointer-events', (d) =>
              arcVisible(d.target) ? 'auto' : 'none'
            )
            .attrTween('d', (d) => () => drawArc(d.current))
        })
      })

    function handleTextUpdate({ current, selected, transition }) {
      backText.datum(selected)

      // Only show back if not on root
      if (current.parent) {
        backText.transition(transition).attr('fill-opacity', 1)
      } else {
        backText.transition(transition).attr('fill-opacity', 0)
      }
    }

    // On cleanup remove the root DOM generated by D3
    return () => g.remove()
  }, [colorDomainMax, colorDomainMin, data, root, svgFontSize, svgRenderSize])

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
  svgFontSize: PropTypes.string,
  colorDomainMin: PropTypes.number,
  colorDomainMax: PropTypes.number,
}

export default Sentry.withProfiler(SunburstChart, {
  name: 'SunburstChart',
})
