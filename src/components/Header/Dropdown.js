import React, { useRef, useState } from 'react'
import { Transition } from '@headlessui/react'
import { useClickAway } from 'react-use'
import { Link } from 'react-router-dom'
import PropType from 'prop-types'
import cs from 'classnames'

import Icon from 'components/Icon'

function Dropdown({ userNav }) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef()
  useClickAway(dropdownRef, () => setIsOpen(false))

  //TODO
  const username = 'TerrySmithDC'
  const avatarUrl =
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'

  return (
    <div ref={dropdownRef} className="ml-3 relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="max-w-xs p-1 bg-gray-800 rounded-full flex items-center text-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
        id="user-menu"
        aria-haspopup="true"
      >
        <span className="sr-only">Open user menu</span>
        <img
          className="h-8 w-8 rounded-full"
          src={avatarUrl}
          alt="user avatar"
        />
        <p className="mx-2">{username}</p>
        <Icon
          name="rightChevron"
          color="text-white"
          className={cs(
            'w-4 h-4 mr-2',
            'transition-transform  duration-75 ease-in-out transform motion-reduce:transition-none motion-reduce:transform-none',
            {
              '-rotate-90': isOpen,
              'rotate-90': !isOpen,
            }
          )}
        />
      </button>
      <Transition
        show={isOpen}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <div
          className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="user-menu"
        >
          {userNav.map(({ label, to }, i) => (
            <Link
              key={i}
              to={to}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              role="menuitem"
            >
              {label}
            </Link>
          ))}
        </div>
      </Transition>
    </div>
  )
}

Dropdown.propTypes = {
  userNav: PropType.arrayOf(
    PropType.shape({
      label: PropType.string.isRequired,
      to: PropType.string.isRequired,
      active: PropType.bool,
    })
  ).isRequired,
}
export default Dropdown
