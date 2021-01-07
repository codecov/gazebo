import PropTypes from 'prop-types'
import { NavLink } from 'react-router-dom'

import Icon from 'ui/Icon'

function SideMenu({ baseUrl }) {
  const links = [
    { to: baseUrl, iconName: 'creditCard', text: 'Billing & Users' },
    { to: baseUrl + 'yaml', iconName: 'fileAlt', text: 'YAML' },
    { to: baseUrl + 'admin', iconName: 'setting', text: 'Admin' },
  ]

  return (
    <aside>
      <section>
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className="flex items-center text-gray-500 p-2 pr-2 mb-2 border-solid border-pink-500 hover:bg-gray-100 hover:border-r-4"
            activeClassName="border-r-4"
          >
            <Icon name={link.iconName} className="mr-1" />
            {link.text}
          </NavLink>
        ))}
      </section>
    </aside>
  )
}

SideMenu.propTypes = {
  baseUrl: PropTypes.string.isRequired,
}

export default SideMenu
