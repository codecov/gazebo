import { Fragment } from 'react'
import Icon from 'components/Icon'
import { NavLink, Link } from 'react-router-dom'
import PropType from 'prop-types'

import ServerStatus from './ServerStatus'
import Dropdown from './Dropdown'

const DesktopMenu = ({ mainNav, userNav }) => (
  <>
    <div className="flex items-center">
      <Link to="/" tabIndex="0" className="flex-shrink-0">
        <span className="sr-only">Link to Homepage</span>
        <Icon alt="Codecov Logo" name="codecov" color="text-white" />
      </Link>
      <div className="hidden md:block">
        <div className="ml-10 flex items-center space-x-2">
          {mainNav.map(({ to, label }, i) => (
            <Fragment key={i}>
              {i !== 0 && (
                <Icon
                  name="rightChevron"
                  color="text-white"
                  className="flex-shrink-0 h-5 w-5"
                />
              )}
              <NavLink
                to={to}
                className="opacity-50 px-3 py-2 rounded-md hover:opacity-100 transition-opacity"
                activeClassName="opacity-100"
                exact={true}
              >
                {label}
              </NavLink>
            </Fragment>
          ))}
        </div>
      </div>
    </div>
    <div className="hidden md:block">
      <div className="ml-4 flex items-center md:ml-6">
        <ServerStatus />
        <Dropdown userNav={userNav} />
      </div>
    </div>
  </>
)

DesktopMenu.propTypes = {
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

export default DesktopMenu
