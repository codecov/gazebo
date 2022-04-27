import cs from 'classnames'
import PropTypes from 'prop-types'

import AppLink from 'shared/AppLink'
import Icon from 'ui/Icon'

const baseClass = `
  font-sans cursor-pointer

  hover:underline

  focus:ring-2
`
const variantClasses = {
  default: `text-ds-blue`,
  header: `font-semibold text-ds-gray-secondary`,
  link: `text-ds-blue-darker`,
  code: `font-mono text-ds-blue-darker`,
}

function _adjustPathForGLSubgroups(path) {
  // Adjusts external url's for any gitlab owners who have subgroups. Gitlab subgroups look like
  // this => "user:subgroup", but Gitlab URLs look like this => "user/subgroup". Hence, this function
  // is to detect if we have a gitlab user with a subgroup and adjust it accordingly. The regex identifies the
  // domain + owner (by selecting everything till the next forward slash) and selecting everything else
  if (!path.includes('gitlab')) {
    return path
  }

  const regex = /(https?:\/\/gitlab.com\/)([^/]*)(.*)/
  const [domain, owner, rest] = path.split(regex).filter(Boolean)
  return domain + owner.replace(/:/g, '/') + rest
}

function A({ to, hook, variant = 'default', children, isExternal, ...props }) {
  const className = cs(
    baseClass,
    variantClasses[variant],
    'inline-flex items-center gap-1'
  )

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
      href={
        completeProps?.href && _adjustPathForGLSubgroups(completeProps?.href)
      }
      className={className}
      data-cy={hook}
      data-marketing={hook}
      target={isExternal && 'blank'}
    >
      {children}
      {isExternal && (
        <span className="text-ds-gray-quinary">
          <Icon size="sm" name="external-link" />
        </span>
      )}
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
  variant: PropTypes.oneOf(['default', 'header', 'link', 'code']),
  isExternal: PropTypes.bool,
}

export default A
