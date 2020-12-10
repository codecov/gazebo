import { useMainNav, useSubNav } from 'services/header'
import { useUser } from 'services/user'
import Icon from 'ui/Icon'

import ServerStatus from './ServerStatus'
import { MainNavLink, UserNavLink } from './NavLink'

function MobileMenu() {
  const main = useMainNav()
  const subMenu = useSubNav()
  const { data: user } = useUser()

  return (
    <nav
      data-testid="mobile-menu"
      className="md:hidden bg-gray-900 z-40 mt-12 text-white"
    >
      <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
        {main.map((props, i) => (
          <MainNavLink
            key={`mobile-mainnav-${i}`}
            className="block px-3 py-2 rounded-md text-gray-300 hover:text-white hover:bg-gray-700"
            {...props}
          />
        ))}
      </div>
      <div className="flex items-center px-5 py-4 border-t border-gray-800">
        {user ? (
          <>
            <div className="flex-shrink-0">
              <img
                className="h-10 w-10 rounded-full"
                src={user.avatarUrl}
                width="40px"
                height="auto"
                alt="User Avatar"
              />
            </div>
            <div className="flex-1 ml-3">{user.username}</div>
          </>
        ) : (
          <a href="/login" className="flex items-center ml-4">
            <Icon name="signIn" color="text-white" className="mr-2" />
            Log in
          </a>
        )}
        <ServerStatus />
      </div>
      <div className="py-3 px-2 sm:px-3 space-y-1">
        {subMenu.map((props, i) => (
          <UserNavLink
            key={`mobile-usernav-${i}`}
            className="px-3 py-2 text-gray-300 hover:text-white"
            {...props}
          />
        ))}
      </div>
    </nav>
  )
}

export default MobileMenu
