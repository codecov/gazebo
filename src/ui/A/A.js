import PropTypes from 'prop-types'
import cs from 'classnames'

import AppLink from 'shared/AppLink'

const baseClass = `
  font-sans cursor-pointer

  hover:underline
`
const variantClasses = {
  default: ``,
  header: `font-semibold text-ds-gray-secondary`,
}

function A({ to, hook, variant = 'default', children, ...props }) {
  const className = cs(baseClass, variantClasses[variant])

  const completeProps = {
    ...props,
    className,
  }

  return to ? (
    <AppLink {...to} {...completeProps}>
      {children}
    </AppLink>
  ) : (
    <a
      {...completeProps}
      className={className}
      data-cy={hook}
      data-marketing={hook}
    >
      {children}
    </a>
  )
}

A.propTypes = {
  to: PropTypes.shape(AppLink.propTypes),
  hook: function (props, propName) {
    if (
      props['to'] === undefined &&
      (props[propName] === undefined || typeof props[propName] != 'string')
    ) {
      return new Error(
        'If not using prop "to" you must provide prop "hook" of type string.'
      )
    }
  },
  variant: PropTypes.oneOf(['default', 'header']),
}

export default A
