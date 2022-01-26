import { Fragment } from 'react'

import PropTypes from 'prop-types'
import A from 'ui/A'
import AppLink from 'shared/AppLink'
import defaultTo from 'lodash/defaultTo'

function Breadcrumb({ paths = [] }) {
  return (
    <nav className="flex items-center text-ds-gray-octonary gap-1 last:font-semibold">
      {paths.map((to, i) => {
        return (
          <Fragment key={i}>
            {i === paths.length - 1 ? (
              <>{defaultTo(to.children, to.text)}</>
            ) : (
              <A to={to}>{defaultTo(to.children, to.text)}</A>
            )}

            {i !== paths.length - 1 && <span>/</span>}
          </Fragment>
        )
      })}
    </nav>
  )
}

export default Breadcrumb

Breadcrumb.propTypes = {
  paths: PropTypes.arrayOf(PropTypes.shape(AppLink.propTypes)),
}
