import PropTypes from 'prop-types'
import cs from 'classnames'
import AppLink from 'shared/AppLink'

function Breadcrumb({ paths }) {
  return (
    <div className={cs('flex items-center')}>
      {paths.map((path, i) => (
        <>
          {i === paths.length - 1 ? (
            <span key={i} className={cs('text-ds-gray-octonary font-semibold')}>
              {path.text}
            </span>
          ) : (
            <AppLink
              {...path}
              className="text-ds-blue-darker"
              key={path.pageName}
            >
              {path.text}
            </AppLink>
          )}

          {i !== paths.length - 1 && <span className="mx-1">/</span>}
        </>
      ))}
    </div>
  )
}

export default Breadcrumb

Breadcrumb.propTypes = {
  paths: PropTypes.arrayOf(PropTypes.shape(AppLink.propTypes)).isRequired,
}
