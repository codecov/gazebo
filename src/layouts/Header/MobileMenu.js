import { useMainNav, useSubNav } from 'services/header'
import { useUser } from 'services/user'
import { ReactComponent as SignInIcon} from 'assets/svg/signIn.svg'

import ServerStatus from './ServerStatus'
import { MainNavLink, UserNavLink } from './NavLink'

function MobileMenu() {
  const main = useMainNav()
  const subMenu = useSubNav()
  const { data: user } = useUser({ suspense: false })

  function loggedInSubMenu() {
    return (
      <>
        <div className="flex items-center py-4 border-t border-gray-800">
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
          <ServerStatus />
        </div>
        <div className="py-3 space-y-1">
          {subMenu.map((props, i) => (
            <UserNavLink
              key={`mobile-usernav-${i}`}
              className="py-2 text-gray-300 hover:text-white"
              {...props}
            />
          ))}
        </div>
      </>
    )
  }

  function loggedOutSubMenu() {
    return (
      <div className="flex items-center py-4 border-t border-gray-800">
        <a href="/login" className="flex-1 flex items-center">
        <SignInIcon className="mr-2" />
          Log in
        </a>
        <ServerStatus />
      </div>
    )
  }

  return (
    <nav
      data-testid="mobile-menu"
      className="md:hidden bg-gray-900 z-40 text-white"
    >
      <div className="pb-1 space-y-1">
        {main.map((props, i) => (
          <MainNavLink
            key={`mobile-mainnav-${i}`}
            className="block py-2 rounded-md text-gray-300 hover:text-white hover:bg-gray-700"
            {...props}
          />
        ))}
      </div>
      {user ? loggedInSubMenu() : loggedOutSubMenu()}
    </nav>
  )
}

export default MobileMenu
