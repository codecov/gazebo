import { useNav } from 'services/header'
import { useUser } from 'services/user'
import ServerStatus from './ServerStatus'
import { UserNavA, MainNavLink } from './NavLink'

function MobileMenu() {
  const { main, user } = useNav()
  const [{ username, avatarUrl }] = useUser()

  return (
    <nav className="md:hidden bg-gray-900 z-40 mt-12 text-white">
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
        <div className="flex-shrink-0">
          <img
            className="h-10 w-10 rounded-full"
            src={avatarUrl}
            width="40px"
            height="auto"
            alt="User Avatar"
          />
        </div>
        <div className="flex-1 ml-3">{username}</div>
        <ServerStatus />
      </div>
      <div className="py-3 px-2 sm:px-3 space-y-1">
        {user.map((props, i) => (
          <UserNavA
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
