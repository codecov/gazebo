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
    { label: 'Organizations', to: '/account/gh/codecov' },
    { label: 'Codecov Settings', to: '/account/gh/codecov' },
    { label: 'Personal Settings', to: '/account/gh/TerrySmithDC' },
    { label: 'Sign Out', to: '/sign-out' },
  ]

  return (
    <header className="fixed top-0 w-full">
      <div className="bg-gray-900 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-50 absolute w-full">
        <nav className="flex items-center justify-between h-16">
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
        </nav>
      </div>
      <Transition
        show={isOpen}
        enter="transform transition-opacity transition-transform duration-300"
        enterFrom="opacity-0 -translate-y-full"
        enterTo="opacity-100 translate-y-0"
      >
        <MobileMenu ref={mobileMenuRef} mainNav={mainNav} userNav={userNav} />
      </Transition>
    </header>
  )
}

export default Header
