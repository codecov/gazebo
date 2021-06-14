import PropTypes from 'prop-types'
import cs from 'classnames'
import AppLink from 'shared/AppLink'

const styles = {
  md: {
    link: '',
    readOnly: 'text-xs',
  },
  lg: {
    link: 'text-xl',
    readOnly: 'text-xl',
  },
}

function Breadcrumb({ paths, size = 'md' }) {
  return (
    <div className={cs('flex items-center', styles[size].link)}>
      {paths.map((path, i) => (
        <>
          {path.readOnly ? (
            <span
              key={i}
              className={cs(
                'text-ds-gray-octonary font-semibold',
                styles[size].readOnly
              )}
            >
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
  size: PropTypes.oneOf(['md', 'lg']),
}
