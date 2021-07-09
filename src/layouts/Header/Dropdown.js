import PropTypes from 'prop-types'

import { Menu, MenuList, MenuButton, MenuLink } from '@reach/menu-button'
import '@reach/menu-button/styles.css'
import AppLink from 'shared/AppLink'
import Avatar from 'ui/Avatar'
import Icon from 'ui/Icon'

function Dropdown({ user }) {
  return (
    <div data-testid="dropdown">
      <Menu id="main-dropdown">
        <MenuButton className="flex items-center justify-between">
          <Avatar user={user} bordered />
          <div className="ml-1" aria-hidden="true">
            <Icon size="sm" name="chevron-down" variant="solid" />
          </div>
        </MenuButton>
        <MenuList>
          <MenuLink
            as={AppLink}
            pageName="account"
            options={{ owner: user.username }}
          >
            Settings
          </MenuLink>
          <MenuLink as={AppLink} pageName="provider">
            Organizations
          </MenuLink>
          <MenuLink as={AppLink} pageName="signOut">
            Sign Out
          </MenuLink>
        </MenuList>
      </Menu>
    </div>
  )
}

Dropdown.propTypes = {
  user: PropTypes.shape({
    avatarUrl: PropTypes.string.isRequired,
    username: PropTypes.string.isRequired,
  }),
}

export default Dropdown
