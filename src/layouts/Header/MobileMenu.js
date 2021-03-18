import { Link } from 'react-router-dom'

import { useMainNav, useSubNav } from 'services/header'
import { useUser } from 'services/user'
import { ReactComponent as SignInIcon } from 'assets/svg/signIn.svg'
import { useNavLinks } from 'services/navigation'
import Button from 'old_ui/Button'

import ServerStatus from './ServerStatus'
import { MainNavLink, UserNavLink } from './NavLink'

function MobileMenu() {
  const main = useMainNav()
  const subMenu = useSubNav()
  const { data: user } = useUser({ suspense: false })
  const { signIn } = useNavLinks()

  function loggedInSubMenu() {
    return (
      <>
        <div className="flex items-center py-4 border-t border-gray-800">
          <div className="flex-shrink-0">
            <img
              className="h-9 w-9 rounded-full"
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

  function loginButton() {
    return (
      <div className="flex items-center py-4 border-t border-gray-800">
        <Button
          Component={Link}
          to={signIn.path()}
          useRouter={!signIn.isExternalLink}
          className="flex-1 flex items-center"
        >
          <SignInIcon className="mr-2" />
          {signIn.text}
        </Button>
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
        {main.map(({ useRouter, ...props }, i) => {
          const activeProps = useRouter && {
            activeClassName: 'opacity-100',
          }

          return (
            <MainNavLink
              key={`mobile-mainnav-${i}`}
              className="block py-2 rounded-md text-gray-300 hover:text-white hover:bg-gray-700"
              useRouter={useRouter}
              {...activeProps}
              {...props}
            />
          )
        })}
      </div>
      {user ? loggedInSubMenu() : loginButton()}
    </nav>
  )
}

export default MobileMenu
