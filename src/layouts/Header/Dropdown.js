import PropTypes from 'prop-types'

import { Menu, MenuList, MenuButton, MenuLink } from '@reach/menu-button'
import AppLink from 'shared/AppLink'
import Avatar from 'ui/Avatar'

// TODO arrow-icon

function Dropdown({ user }) {
  return (
    <Menu>
      <MenuButton>
        <Avatar user={user} bordered={true} />
      </MenuButton>
      <MenuList>
        <MenuLink as={AppLink} pageName={'account'}>
          Settings
        </MenuLink>
        <MenuLink as={AppLink} pageName={'provider'}>
          Organizations
        </MenuLink>
        <MenuLink as={AppLink} pageName={'signOut'}>
          Sign Out
        </MenuLink>
      </MenuList>
    </Menu>
  )
}

Dropdown.propTypes = {
  user: PropTypes.shape({
    avatarUrl: PropTypes.string.isRequired,
    userName: PropTypes.string.isRequired,
  }),
}

export default Dropdown
