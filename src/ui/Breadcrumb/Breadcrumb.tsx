import defaultTo from 'lodash/defaultTo'
import PropTypes from 'prop-types'
import { Fragment, useCallback, useEffect, useRef, useState } from 'react'

import AppLink from 'shared/AppLink'
import { cn } from 'shared/utils/cn'
import A from 'ui/A'

interface BreadcrumbProps {
  paths: Array<{ text: string; children?: React.ReactNode; to?: string }>
  largeFont?: boolean
  direction?: 'ltr' | 'rtl' // Specify direction of text flow
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({
  paths = [],
  largeFont = false,
  direction = 'ltr', // Default LTR direction
}) => {
  const breadcrumbRef = useRef<HTMLDivElement>(null)
  const [visibleItemsCount, setVisibleItemsCount] = useState(paths.length)

  // Calculate how many breadcrumb items can fit within the container
  const calculateVisibleItems = useCallback(() => {
    if (breadcrumbRef.current) {
      const containerWidth = breadcrumbRef.current.offsetWidth
      let totalWidth = 0
      let maxVisibleItems = paths.length

      // Estimate the width of each breadcrumb item (simplified calculation)
      const itemWidths = paths.map((path) => {
        const length = defaultTo(path.children, path.text).length
        return length * 10 // Roughly 10px per character
      })

      // Calculate how many items fit in the container
      for (let i = 0; i < paths.length; i++) {
        totalWidth += itemWidths[i]
        if (totalWidth > containerWidth) {
          maxVisibleItems = i
          break
        }
      }

      setVisibleItemsCount(maxVisibleItems > 1 ? maxVisibleItems : 1) // Ensure at least one item is always visible
    }
  }, [paths, breadcrumbRef])

  useEffect(() => {
    calculateVisibleItems() // Initial calculation
    window.addEventListener('resize', calculateVisibleItems) // Recalculate on window resize
    return () => window.removeEventListener('resize', calculateVisibleItems)
  }, [calculateVisibleItems, paths])

  const visibleBreadcrumbs = paths.slice(0, visibleItemsCount)

  const showEllipsis = visibleItemsCount < paths.length
  let fullPath = paths.map((to) => defaultTo(to.children, to.text)).join(' / ')
  if (direction === 'rtl') {
    fullPath = paths
      .map((to) => defaultTo(to.children, to.text))
      .reverse()
      .join(' / ')
  }

  return (
    <nav
      ref={breadcrumbRef}
      className={cn(
        'flex flex-1 items-center truncate text-ds-gray-octonary',
        { 'text-lg': largeFont },
        { 'flex-row-reverse': direction === 'rtl' }, // Support for RTL layout
        '[&>*]:mx-1' // Adjust spacing between breadcrumb items
      )}
    >
      {/* Render the visible breadcrumbs */}
      {visibleBreadcrumbs.map((to, i) => (
        <Fragment key={i}>
          {i === visibleBreadcrumbs.length - 1 && !showEllipsis ? (
            <span
              className="flex items-center font-semibold"
              title={defaultTo(to.children, to.text)}
            >
              {defaultTo(to.children, to.text)}
            </span>
          ) : (
            <A
              to={to?.to}
              title={defaultTo(to.children, to.text)}
              className="truncate"
            >
              {defaultTo(to.children, to.text)}
            </A>
          )}
          {i !== visibleBreadcrumbs.length - 1 && <span>/</span>}
        </Fragment>
      ))}

      {showEllipsis && (
        <>
          <span className="cursor-default" title={fullPath}>
            ...
          </span>
        </>
      )}
    </nav>
  )
}

export default Breadcrumb

Breadcrumb.propTypes = {
  // @ts-ignore errors until we can global fix AppLink.js
  paths: PropTypes.arrayOf(PropTypes.shape(AppLink.propTypes)),
  largeFont: PropTypes.bool,
}
