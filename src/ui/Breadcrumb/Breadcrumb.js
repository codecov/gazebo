import { Fragment } from 'react'

import PropTypes from 'prop-types'
import A from 'ui/A'

function Breadcrumb({ paths }) {
  console.log(paths)
  return (
    <div className="flex items-center">
      {paths.map((path, i) => (
        <Fragment key={i}>
          {i === paths.length - 1 ? (
            <span className="text-ds-gray-octonary font-semibold">
              {path.text}
            </span>
          ) : (
            <A {...path}>{path.text}</A>
          )}

          {i !== paths.length - 1 && <span className="mx-1">/</span>}
        </Fragment>
      ))}
    </div>
  )
}

export default Breadcrumb

Breadcrumb.propTypes = {
  paths: PropTypes.arrayOf(PropTypes.shape(A.propTypes)).isRequired,
}
