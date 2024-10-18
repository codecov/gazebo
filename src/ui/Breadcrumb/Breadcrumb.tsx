import defaultTo from 'lodash/defaultTo'
import PropTypes from 'prop-types'
import { Fragment, Key } from 'react'

import AppLink from 'shared/AppLink'
import { cn } from 'shared/utils/cn'
import A from 'ui/A'

export interface BreadcrumbProps {
  paths: any
  largeFont: any
  truncateOptions?: TruncateOptions
  flippedDirection: boolean
}

interface TruncateOptions {
  prefix: string
}

function Breadcrumb({
  paths,
  largeFont,
  truncateOptions,
  flippedDirection,
}: BreadcrumbProps) {
  console.log('testing')
  return (
    <>
      {truncateOptions ? <div>...</div> : null}
      {/*space-x-1 doesn't work when text is rendered rtl, using margins*/}
      <nav
        className={cn(
          'flex flex-1 items-center truncate text-ds-gray-octonary [&>*]:mr-1',
          { 'text-lg': largeFont }
        )}
      >
        {paths.map(
          (to: { children: any; text: any }, i: Key | null | undefined) => {
            return (
              <Fragment key={i}>
                {i === paths.length - 1 ? (
                  <span className="flex items-center font-semibold">
                    {defaultTo(to.children, to.text)}
                  </span>
                ) : (
                  // @ts-ignore errors until we can global fix A.js
                  <A to={to}>{defaultTo(to.children, to.text)}</A>
                )}

                {i !== paths.length - 1 && <span>/</span>}
              </Fragment>
            )
          }
        )}
      </nav>
    </>
  )
}

export default Breadcrumb

Breadcrumb.propTypes = {
  // @ts-ignore errors until we can global fix AppLink.js
  paths: PropTypes.arrayOf(PropTypes.shape(AppLink.propTypes)),
  largeFont: PropTypes.bool,
}
