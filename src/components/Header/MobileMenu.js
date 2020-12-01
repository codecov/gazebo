import { forwardRef } from 'react'
import { Link, NavLink } from 'react-router-dom'
import PropType from 'prop-types'
import ServerStatus from './ServerStatus'

// Temp
const username = 'Tom'
const avatarUrl =
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'

const MobileMenu = forwardRef(({ mainNav = [], userNav = [] }, ref) => (
  <nav ref={ref} className="md:hidden bg-header">
    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
      {mainNav.map(({ to, label }, i) => (
        <NavLink
          key={i}
          to={to}
          className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700"
          activeClassName="text-white bg-gray-900"
        >
          {label}
        </NavLink>
      ))}
    </div>
    <div className="pt-4 pb-3 border-t border-gray-700">
      <div className="flex items-center px-5">
        <div className="flex-shrink-0">
          <img className="h-10 w-10 rounded-full" src={avatarUrl} alt="" />
        </div>
        <div className="flex-1 ml-3">
          <div className="text-base font-medium text-white">{username}</div>
        </div>
        <ServerStatus />
      </div>
      <div className="mt-3 px-2 space-y-1">
        {userNav.map(({ to, label }, i) => (
          <Link
            key={i}
            to={to}
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-white hover:bg-gray-700"
          >
            {label}
          </Link>
        ))}
      </div>
    </div>
  </nav>
))

MobileMenu.displayName = 'MobileMenu'

MobileMenu.propTypes = {
  mainNav: PropType.arrayOf(
    PropType.shape({
      label: PropType.string.isRequired,
      to: PropType.string.isRequired,
      active: PropType.bool,
    })
  ).isRequired,
  userNav: PropType.arrayOf(
    PropType.shape({
      label: PropType.string.isRequired,
      to: PropType.string.isRequired,
      active: PropType.bool,
    })
  ).isRequired,
}

export default MobileMenu
