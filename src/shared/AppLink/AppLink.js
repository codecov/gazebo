import { forwardRef } from 'react'
import PropTypes from 'prop-types'
import defaultTo from 'lodash/defaultTo'
import { Link, NavLink } from 'react-router-dom'

import { useNavLinks, useStaticNavLinks } from 'services/navigation'

function useLinkConfig(pageName) {
  const navLinks = useNavLinks()
  const staticLinks = useStaticNavLinks()

  if (pageName in navLinks) return navLinks[pageName]
  if (pageName in staticLinks) return staticLinks[pageName]
  return null
}

function getComponentToRender(pageConfig, activeClassName) {
  if (pageConfig.isExternalLink) return 'a'
  if (activeClassName) return NavLink
  return Link
}

const AppLink = forwardRef(
  ({ pageName, options, activeClassName, children, ...props }, ref) => {
    const pageConfig = useLinkConfig(pageName)

    if (!pageConfig) return null

    const path = pageConfig.path(options)

    const Component = getComponentToRender(pageConfig, activeClassName)
    const { openNewPage } = pageConfig

    const propsLink = pageConfig.isExternalLink ? { href: path } : { to: path }
    const propsActive =
      Component === NavLink
        ? {
            activeClassName,
          }
        : {}

    const completeProps = {
      ...propsLink,
      ...props,
      ...propsActive,
    }

    /*
      data-cy: hook for cypress tests
      data-marketing: hook for marketing tools
    */

    return (
      <Component
        data-cy={pageName}
        data-marketing={pageName}
        {...completeProps}
        ref={ref}
        target={openNewPage && '_blank'}
      >
        {defaultTo(children, pageConfig.text)}
      </Component>
    )
  }
)

AppLink.propTypes = {
  // You can find the page name in this file
  // https://github.com/codecov/gazebo/blob/main/src/services/navigation/useNavLinks.js
  pageName: PropTypes.string.isRequired,
  text: PropTypes.string,
  options: PropTypes.object,
  activeClassName: PropTypes.string,
}

export default AppLink
