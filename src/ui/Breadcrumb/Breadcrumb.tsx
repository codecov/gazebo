import defaultTo from 'lodash/defaultTo'
import PropTypes from 'prop-types'
import { Fragment } from 'react'

import AppLink from 'shared/AppLink'
import { cn } from 'shared/utils/cn'
import A from 'ui/A'

interface BreadcrumbProps {
  paths: Array<{ text: string; children?: React.ReactNode; to?: string }>
  largeFont?: boolean
  truncate?: boolean
  direction?: 'ltr' | 'rtl'
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({
  paths = [],
  largeFont = false,
  truncate = false,
  direction = 'ltr',
}) => {
  return (
    <nav
      className={cn(
        'flex flex-1 items-center truncate text-ds-gray-octonary',
        { 'text-lg': largeFont },
        { 'flex-row-reverse': direction === 'rtl' }, // Reverse for RTL
        { '[&>*]:mr-1': direction === 'ltr', '[&>*]:ml-1': direction === 'rtl' } // Margin direction based on text direction
      )}
    >
      {paths.map((to, i) => {
        const text = defaultTo(to.children, to.text)
        const shouldTruncate = truncate ? 'truncate' : ''

        return (
          <Fragment key={i}>
            {i === paths.length - 1 ? (
              // Larger max-width for the last item
              <span
                className={cn(
                  'flex items-center font-semibold',
                  shouldTruncate,
                  {
                    'max-w-[200px]': truncate, // Larger space for the last breadcrumb
                  }
                )}
                title={truncate ? text : undefined}
              >
                {text}
              </span>
            ) : (
              // Smaller max-width for intermediate items
              <A
                to={to?.to}
                className={cn(shouldTruncate, { 'max-w-[100px]': truncate })}
                title={truncate ? text : undefined}
              >
                {text}
              </A>
            )}

            {i !== paths.length - 1 && (
              <span>{direction === 'rtl' ? '\\' : '/'}</span>
            )}
          </Fragment>
        )
      })}
    </nav>
  )
}

export default Breadcrumb

Breadcrumb.propTypes = {
  // @ts-ignore errors until we can global fix AppLink.js
  paths: PropTypes.arrayOf(PropTypes.shape(AppLink.propTypes)),
  largeFont: PropTypes.bool,
}
