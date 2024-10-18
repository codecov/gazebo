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
  default: `text-ds-blue-default`,
  header: `font-semibold`,
  headerDeprecated: `font-semibold text-ds-gray-secondary`,
  guestHeader: `font-semibold text-ds-gray-senary dark:text-ds-default-text`,
  link: `text-ds-blue-darker`,
  semibold: 'text-ds-blue-darker font-semibold dark:text-ds-blue-default',
  medium: 'text-ds-blue-darker font-medium dark:text-ds-blue-default',
  code: `font-mono text-ds-blue-default`,
  cardLink: `text-ds-grey-octinary font-semibold truncate`,
  greyOctinary: `text-ds-gray-octinary`,
  grayQuinary: `text-ds-gray-quinary`,
  headerHighlight: `font-semibold text-ds-pink-default`,
  upDirectory: `flex flex-grow text-ds-blue-default hover:no-underline focus:ring-0 w-full`,
  black: `text-ds-secondary-text`,
  blueSeptenary: `text-ds-blue-septenary`,
  configure: `rounded bg-ds-blue-default px-4 py-1 font-semibold text-ds-gray-primary dark:text-white dark:bg-ds-blue-nonary`,
}

export const getHostnameFromRegex = (url) => {
  if (!url) {
    return 'app.codecov.io'
  }
  // run against regex
  const matches = url.match(/^https?:\/\/([^/?#]+)(?:[/?#]|$)/i)
  // extract hostname (will be null if no match is found)
  return matches && matches[1]
}

function _adjustPathForGLSubgroups(path) {
  // Adjusts external url's for any gitlab owners who have subgroups. Gitlab subgroups look like
  // this => "user:subgroup", but Gitlab URLs look like this => "user/subgroup". Hence, this function
  // is to detect if we have a gitlab user with a subgroup and adjust it accordingly. The regex identifies the
  // domain + owner (by selecting everything till the next forward slash) and selecting everything else
  const host = getHostnameFromRegex(path)
  const acceptedPaths = ['gitlab.com']
  if (!acceptedPaths.includes(host)) {
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
    'inline-flex items-center gap-1 truncate'
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
      data-testid={hook}
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
  variant: PropTypes.oneOf([
    'default',
    'header',
    'headerDeprecated',
    'guestHeader',
    'link',
    'code',
    'cardLink',
    'fileViewHeader',
    'semibold',
    'medium',
    'grayQuinary',
    'greyOctinary',
    'headerHighlight',
    'upDirectory',
    'black',
    'blueSeptenary',
    'configure',
  ]),
  isExternal: PropTypes.bool,
}

export default A
