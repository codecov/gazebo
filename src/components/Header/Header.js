import React, { useState, useRef } from 'react'
import { Transition } from '@headlessui/react'
import { useClickAway } from 'react-use'

import Icon from 'components/Icon'
import DesktopMenu from './DesktopMenu'
import MobileMenu from './MobileMenu'

function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const mobileMenuRef = useRef()
  useClickAway(mobileMenuRef, () => setIsOpen(false))

  // Todo
  const mainNav = [
    { label: 'github', to: '/gh' },
    { label: 'codecov', to: '/gh/codecov' },
    { label: 'gazebo', to: '/gh/codecov/gazebo' },
  ]
  const userNav = [
    { label: 'User Settings', to: '/account/gh/TerrySmithDC' },
    { label: 'Team Settings', to: '/account/gh/codecov' },
    { label: 'Logout', to: '/logout' },
  ]

  return (
    <header className="bg-codecov-header fixed top-0 w-full z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <DesktopMenu mainNav={mainNav} userNav={userNav} />
          <div className="-mr-2 flex md:hidden">
            {/* <!-- Mobile menu button --> */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="bg-gray-800 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white h-10 w-10"
            >
              <span className="sr-only">Open main menu</span>
              {/* Menu open: "hidden", Menu closed: "block" */}
              <Transition
                show={!isOpen}
                enter="hidden"
                // enterFrom=""
                // enterTo=""
                leave="block"
                // leaveFrom=""
                // leaveTo=""
              >
                <Icon name="hamburger" color="text-white" />
              </Transition>
              {/* Menu open: "block", Menu closed: "hidden" */}
              <Transition
                show={isOpen}
                enter="hidden"
                // enterFrom=""
                // enterTo=""
                leave="block"
                // leaveFrom=""
                // leaveTo=""
              >
                <Icon name="times" color="text-white" />
              </Transition>
            </button>
          </div>
        </div>
      </nav>

      {/* <!--
      Mobile menu, toggle classes based on menu state.

      Open: "block", closed: "hidden"
    --> */}
      <Transition
        show={isOpen}
        enter="block"
        // enterFrom=""
        // enterTo=""
        leave="hidden"
        // leaveFrom=""
        // leaveTo=""
      >
        <MobileMenu ref={mobileMenuRef} mainNav={mainNav} userNav={userNav} />
      </Transition>
    </header>
  )
}

export default Header
