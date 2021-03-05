import PropType from 'prop-types'
import cs from 'classnames'
import { NavLink } from 'react-router-dom'
import Icon from 'ui/Icon'
import AppLink from 'ui/AppLink'

const UserNav = {
  label: PropType.string.isRequired,
  imageUrl: PropType.string,
  iconName: PropType.string,
}

export function UserNavLink({
  label,
  imageUrl,
  iconName,
  className,
  LinkComponent = 'a',
  ...props
}) {
  return (
    <AppLink
      Component={LinkComponent}
      className={cs('flex items-center py-2 text-sm', className)}
      {...props}
    >
      {imageUrl && (
        <img className="h-4 w-4 rounded-full" src={imageUrl} alt={label} />
      )}
      {iconName && (
        <Icon
          testId="nav-link-icon"
          name={iconName}
          className="h-4 w-4"
          color="text-white"
        />
      )}
      <span className="pl-3">{label}</span>
    </AppLink>
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
  return (
    <AppLink
      Component={NavLink}
      className={cs('flex items-center', className)}
      {...props}
    >
      {imageUrl && (
        <img className="h-6 w-6 rounded-full" src={imageUrl} alt={label} />
      )}
      <span className="pl-3">{label}</span>
    </AppLink>
  )
}

MainNavLink.propTypes = UserNav
