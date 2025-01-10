import defaultTo from 'lodash/defaultTo'
import { forwardRef } from 'react'
import { Link, NavLink } from 'react-router-dom'

import { useNavLinks, useStaticNavLinks } from 'services/navigation'
import Icon from 'ui/Icon'

function useLinkConfig<T extends string>(pageName: T): LinkConfig | null {
  const navLinks = useNavLinks()
  const staticLinks = useStaticNavLinks()

  if (pageName in navLinks) return navLinks[pageName as keyof typeof navLinks]
  if (pageName in staticLinks)
    return staticLinks[pageName as keyof typeof staticLinks]
  return null
}

interface LinkConfig {
  text?: string
  path: ((options?: any) => string) | (() => string)
  isExternalLink?: boolean
  openNewTab?: boolean
}

function useCompleteProps(
  Component: typeof Link | typeof NavLink | 'a',
  props: Record<string, unknown>,
  options: Record<string, any>,
  pageConfig: LinkConfig | null,
  activeClassName?: string
) {
  const path = pageConfig?.path(options)

  const propsLink = pageConfig?.isExternalLink
    ? { href: path }
    : Component === 'a'
      ? { href: path }
      : { to: path || '/' }

  const propsTarget = pageConfig?.openNewTab ? { target: '_blank' } : {}
  const propsActive = Component === NavLink ? { activeClassName } : {}

  return {
    ...propsLink,
    ...propsTarget,
    ...props,
    ...propsActive,
  }
}

function getComponentToRender(
  pageConfig: LinkConfig | null,
  activeClassName?: string
) {
  if (pageConfig?.isExternalLink) return 'a'
  if (activeClassName) return NavLink
  return Link
}

export interface AppLinkProps extends React.HTMLProps<HTMLAnchorElement> {
  pageName: string
  text?: string
  options?: Record<string, unknown>
  activeClassName?: string
  showExternalIcon?: boolean
  type?: 'submit' | 'button' | 'reset'
  children?: React.ReactNode
  exact?: boolean
}

const AppLink = forwardRef<HTMLAnchorElement, AppLinkProps>(
  (
    {
      pageName,
      options,
      activeClassName,
      children,
      showExternalIcon = true,
      ...props
    }: AppLinkProps,
    ref
  ) => {
    const pageConfig = useLinkConfig(pageName) as LinkConfig | null
    const Component = getComponentToRender(pageConfig, activeClassName)
    const completeProps = useCompleteProps(
      Component,
      props,
      options || {},
      pageConfig,
      activeClassName
    )

    if (!pageConfig) return null
    return (
      <Component
        to={pageConfig.path}
        /*
          data-cy: hook for cypress tests
          data-marketing: hook for marketing tools
        */
        data-cy={pageName}
        data-marketing={pageName}
        {...completeProps}
        ref={ref}
      >
        {defaultTo(children, pageConfig.text)}
        {showExternalIcon && pageConfig.openNewTab && (
          <span className="text-ds-gray-quinary">
            <Icon size="sm" name="externalLink" />
          </span>
        )}
      </Component>
    )
  }
)

AppLink.displayName = 'AppLink'

export default AppLink
