import PropType from 'prop-types'
import cs from 'classnames'
import { NavLink, useParams } from 'react-router-dom'

import githubLogo from 'assets/githublogo.png'

const UserNav = {
  label: PropType.string.isRequired,
  imageUrl: PropType.string,
  iconName: PropType.string,
}

const providerIcons = {
    'gh': githubLogo
}

export function UserNavLink({
  label,
  imageUrl,
  iconName,
  className,
  LinkComponent = 'a',
  ...props
}) {

  const { provider } = useParams()

  return (
    <LinkComponent
      className={cs('flex items-center py-2 text-sm', className)}
      {...props}
    >
      {imageUrl && (
        <img className="h-4 w-4 rounded-full" src={imageUrl} alt={label} />
      )}
      {iconName && (
        <img height={32} width={32} src={providerIcons[provider]} alt="provider-logo"/>
      )}
      <span className="pl-3">{label}</span>
    </LinkComponent>
  )
}

UserNavLink.propTypes = {
  ...UserNav,
  LinkComponent: PropType.elementType,
}

export function MainNavLink({
  label,
  imageUrl,
  iconName,
  className,
  ...props
}) {

  const { provider } = useParams()

  return (
    <NavLink className={cs('flex items-center', className)} {...props}>
      {imageUrl && (
        <img className="h-6 w-6 rounded-full" src={imageUrl} alt={label} />
      )}
      {iconName && (
        <img height={32} width={32} src={providerIcons[provider]} alt="provider-logo"/>
      )}
      <span className="pl-3">{label}</span>
    </NavLink>
  )
}

MainNavLink.propTypes = UserNav
