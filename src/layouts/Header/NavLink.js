import PropType from 'prop-types'
import cs from 'classnames'
import { NavLink } from 'react-router-dom'
import Icon from 'old_ui/Icon'
import AppLink from 'old_ui/AppLink'
import Avatar from 'old_ui/Avatar/Avatar'

const UserNav = {
  label: PropType.string.isRequired,
  imageUrl: PropType.string,
  iconName: PropType.string,
  useRouter: PropType.bool,
}

export function UserNavLink({
  label,
  imageUrl,
  iconName,
  className,
  ...props
}) {
  return (
    <AppLink
      Component={NavLink}
      className={cs('flex items-center py-2 text-sm', className)}
      {...props}
    >
      <Avatar
        className="h-4 w-4 rounded-full"
        avatarUrl={imageUrl}
        username={label}
        alt={label}
      />
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
      <Avatar
        className="h-6 w-6 rounded-full"
        avatarUrl={imageUrl}
        username={label}
        alt={label}
      />
      <span className="pl-3">{label}</span>
    </AppLink>
  )
}

MainNavLink.propTypes = UserNav
