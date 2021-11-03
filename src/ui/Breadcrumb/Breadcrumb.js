import { Fragment } from 'react'

import PropTypes from 'prop-types'
import A from 'ui/A'
import AppLink from 'shared/AppLink'

function Breadcrumb({ paths = [] }) {
  return (
    <nav className="flex items-center gap-1">
      {paths.map((to, i) => {
        return (
          <Fragment key={i}>
            {i === paths.length - 1 ? (
              <span className="text-ds-gray-octonary font-semibold">
                {to.text}
              </span>
            ) : (
              <A to={to}>{to.text}</A>
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
