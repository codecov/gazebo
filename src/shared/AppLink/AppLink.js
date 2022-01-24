import { forwardRef } from 'react'
import PropTypes from 'prop-types'
import defaultTo from 'lodash/defaultTo'
import { Link, NavLink } from 'react-router-dom'

import { useNavLinks, useStaticNavLinks } from 'services/navigation'
import Icon from 'ui/Icon'

function useLinkConfig(pageName) {
  const navLinks = useNavLinks()
  const staticLinks = useStaticNavLinks()

  if (pageName in navLinks) return navLinks[pageName]
  if (pageName in staticLinks) return staticLinks[pageName]
  return null
}

function useCompleteProps(
  Component,
  props,
  options,
  pageConfig,
  activeClassName
) {
  const path = pageConfig?.path(options)

  const propsLink = pageConfig?.isExternalLink ? { href: path } : { to: path }
  const propsTarget = pageConfig?.isExternalLink ? { target: '_blank' } : {}
  const propsActive =
    Component === NavLink
      ? {
          activeClassName,
        }
      : {}

  return {
    ...propsLink,
    ...propsTarget,
    ...props,
    ...propsActive,
  }
}

function getComponentToRender(pageConfig, activeClassName) {
  if (pageConfig?.isExternalLink) return 'a'
  if (activeClassName) return NavLink
  return Link
}

const AppLink = forwardRef(
  (
    {
      pageName,
      options,
      activeClassName,
      hideExternalIcon,
      children,
      ...props
    },
    ref
  ) => {
    const pageConfig = useLinkConfig(pageName)

    const Component = getComponentToRender(pageConfig, activeClassName)
    const showExternalIcon = pageConfig?.isExternalLink && !hideExternalIcon
    const completeProps = useCompleteProps(
      Component,
      props,
      options,
      pageConfig,
      activeClassName
    )

    if (!pageConfig) return null
    /*
    data-cy: hook for cypress tests
    data-marketing: hook for marketing tools
    */ return (
      <Component
        data-cy={pageName}
        data-marketing={pageName}
        {...completeProps}
        ref={ref}
      >
        {defaultTo(children, pageConfig.text)}
        {showExternalIcon && (
          <span className="text-ds-gray-quinary">
            <Icon size="sm" name="external-link"></Icon>
          </span>
        )}
      </Component>
    )
  }
)

AppLink.displayName = 'AppLink'

AppLink.propTypes = {
  // You can find the page name in this file
  // https://github.com/codecov/gazebo/blob/main/src/services/navigation/useNavLinks.js
  pageName: PropTypes.string.isRequired,
  text: PropTypes.string,
  options: PropTypes.object,
  activeClassName: PropTypes.string,
  hideExternalIcon: PropTypes.bool,
}

export default AppLink
