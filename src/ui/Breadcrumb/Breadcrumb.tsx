import defaultTo from 'lodash/defaultTo'
import { Fragment } from 'react'

import { Breadcrumb as BreadcrumbType } from 'pages/RepoPage/context'
import { cn } from 'shared/utils/cn'
import A from 'ui/A'

interface BreadcrumbProps {
  paths?: BreadcrumbType[]
  largeFont?: boolean
}

function Breadcrumb({ paths = [], largeFont = false }: BreadcrumbProps) {
  return (
    // space-x-1 doesn't work when text is rendered rtl, using margins
    <nav
      className={cn(
        'flex flex-1 items-center truncate text-ds-gray-octonary [&>*]:mr-1',
        { 'text-lg': largeFont }
      )}
    >
      {paths.map((to, i) => {
        return (
          <Fragment key={i}>
            {i === paths.length - 1 ? (
              <span className="flex items-center font-semibold">
                {defaultTo(to.children, to.text)}
              </span>
            ) : (
              <A to={to} hook={undefined} isExternal={false}>
                {defaultTo(to.children, to.text)}
              </A>
            )}

            {i !== paths.length - 1 && <span>/</span>}
          </Fragment>
        )
      })}
    </nav>
  )
}

export default Breadcrumb
