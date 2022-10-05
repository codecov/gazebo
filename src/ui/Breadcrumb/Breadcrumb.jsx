import defaultTo from 'lodash/defaultTo'
import PropTypes from 'prop-types'
import { Fragment } from 'react'

import AppLink from 'shared/AppLink'
import A from 'ui/A'

function Breadcrumb({ paths = [] }) {
  return (
    <nav className="flex items-center text-ds-gray-octonary gap-1">
      {paths.map((to, i) => {
        return (
          <Fragment key={i}>
            {i === paths.length - 1 ? (
              <span className="font-semibold">
                {defaultTo(to.children, to.text)}
              </span>
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
