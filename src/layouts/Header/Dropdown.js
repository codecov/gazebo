import PropTypes from 'prop-types'

import { Menu, MenuList, MenuButton, MenuLink } from '@reach/menu-button'
import '@reach/menu-button/styles.css'
import AppLink from 'shared/AppLink'
import Avatar from 'ui/Avatar'
import Icon from 'ui/Icon'
import { useParams } from 'react-router'
import { providerToName } from 'shared/utils/provider'

function Dropdown({ currentUser }) {
  const { provider } = useParams()
  const isGh = providerToName(provider) === 'Github'

  return (
    <div data-testid="dropdown" data-cy="auth-user-dropdown">
      <Menu id="main-dropdown">
        <MenuButton className="flex items-center justify-between">
          <Avatar user={currentUser.user} bordered />
          <div className="ml-1" aria-hidden="true">
            <Icon size="sm" name="chevron-down" variant="solid" />
          </div>
        </MenuButton>
        <MenuList>
          {isGh && (
            <MenuLink
              as={AppLink}
              pageName="userAppManagePage"
              hideExternalIcon
            >
              Manage GitHub org access
            </MenuLink>
          )}
          <MenuLink
            as={AppLink}
            pageName="account"
            options={{ owner: currentUser.user.username }}
          >
            Settings
          </MenuLink>
          <MenuLink as={AppLink} pageName="provider">
            Organizations
          </MenuLink>
          <MenuLink as={AppLink} pageName="signOut" hideExternalIcon>
            Sign Out
          </MenuLink>
        </MenuList>
      </Menu>
    </div>
  )
}

Dropdown.propTypes = {
  currentUser: PropTypes.shape({
    user: PropTypes.shape({
      avatarUrl: PropTypes.string.isRequired,
      username: PropTypes.string.isRequired,
    }).isRequired,
  }),
}

export default Dropdown
