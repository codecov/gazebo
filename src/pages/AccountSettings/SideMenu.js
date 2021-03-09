import PropTypes from 'prop-types'
import { NavLink } from 'react-router-dom'

import Icon from 'ui/Icon'
import AppLink from 'ui/AppLink'

function SideMenu({ baseUrl, isPersonalSettings }) {
  const personalLinks = [
    { to: baseUrl + 'access', iconName: 'creditCard', text: 'Access' },
  ]

  const organizationLinks = [
    {
      to: baseUrl + 'billing',
      iconName: 'creditCard',
      text: 'Billing & Users',
    },
  ]

  const links = [
    { to: baseUrl, iconName: 'setting', text: 'Admin' },
    ...(isPersonalSettings ? personalLinks : organizationLinks),
    { to: baseUrl + 'yaml', iconName: 'fileAlt', text: 'YAML' },
  ]

  return (
    <aside>
      <section className="flex flex-row lg:flex-col">
        {links.map((link) => (
          <AppLink
            Component={NavLink}
            exact={baseUrl === link.to}
            key={link.to}
            to={link.to}
            className="flex-1 flex tems-center text-gray-500 p-2 pr-2 mb-2 border-solid border-pink-500 hover:bg-gray-100"
            activeClassName="border-b-4 lg:border-b-0 lg:border-r-4"
          >
            <Icon name={link.iconName} className="mr-1" />
            {link.text}
          </AppLink>
        ))}
      </section>
    </aside>
  )
}

SideMenu.propTypes = {
  baseUrl: PropTypes.string.isRequired,
  isPersonalSettings: PropTypes.bool.isRequired,
}

export default SideMenu
