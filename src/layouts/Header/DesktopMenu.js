import { Fragment } from 'react'
import Icon from 'ui/Icon'
import AppLink from 'ui/AppLink'

import ServerStatus from './ServerStatus'
import Dropdown from './Dropdown'
import { MainNavLink } from './NavLink'
import { useMainNav } from 'services/header'
import { useStaticNavLinks } from 'services/navigation'
import { ReactComponent as CodecovIcon } from 'assets/svg/codecov.svg'

function DesktopMenu() {
  const main = useMainNav()
  const { root } = useStaticNavLinks()

  return (
    <>
      <div data-testid="desktop-menu" className="flex items-center">
        <AppLink to={root.path()} tabIndex="0" className="flex-shrink-0">
          <span className="sr-only">Link to Homepage</span>
          <CodecovIcon className="text-pink-500 mr-2" />
        </AppLink>
        <div className="hidden md:block">
          <div className="ml-10 flex items-center space-x-2">
            {main.map((props, i) => (
              <Fragment key={`desktopMenu-${i}`}>
                {i !== 0 && (
                  <Icon
                    name="rightChevron"
                    color="text-white"
                    className="flex-shrink-0 h-5 w-5"
                  />
                )}
                <MainNavLink
                  className="opacity-50 px-3 py-2 rounded-md hover:opacity-100 transition-opacity"
                  activeClassName="opacity-100"
                  exact={true}
                  {...props}
                />
              </Fragment>
            ))}
          </div>
        </div>
      </div>
      <div className="hidden md:block">
        <div className="ml-4 flex items-center md:ml-6">
          <ServerStatus />
          <Dropdown />
        </div>
      </div>
    </>
  )
}

export default DesktopMenu
