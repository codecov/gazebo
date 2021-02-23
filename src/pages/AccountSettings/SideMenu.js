import PropTypes from 'prop-types'
import { NavLink } from 'react-router-dom'
import uniqueId from 'lodash/uniqueId'

import { accountLinks } from 'shared/router'
import Icon from 'ui/Icon'

function SideMenu({ isPersonalSettings, provider, owner }) {
  const personalLinks = [
    {
      props: {
        to: accountLinks.accessTab.createPath({ provider, owner }),
      },
      iconName: 'creditCard',
      text: accountLinks.accessTab.text,
    },
  ]

  const organizationLinks = [
    {
      props: {
        to: accountLinks.billingAndUsers.createPath({ provider, owner }),
      },
      iconName: 'creditCard',
      text: accountLinks.billingAndUsers.text,
    },
  ]

  const links = [
    {
      props: {
        to: accountLinks.root.createPath({ provider, owner }),
        exact: true,
      },
      iconName: 'setting',
      text: accountLinks.root.text,
    },
    ...(isPersonalSettings ? personalLinks : organizationLinks),
    {
      props: {
        to: accountLinks.yamlTab.createPath({ provider, owner }),
      },
      iconName: 'fileAlt',
      text: accountLinks.yamlTab.text,
    },
  ]

  return (
    <aside>
      <section className="flex flex-row lg:flex-col">
        {links.map((link) => (
          <NavLink
            key={uniqueId(link.text)}
            {...link.props}
            className="flex-1 flex tems-center text-gray-500 p-2 pr-2 mb-2 border-solid border-pink-500 hover:bg-gray-100"
            activeClassName="border-b-4 lg:border-b-0 lg:border-r-4"
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
  isPersonalSettings: PropTypes.bool.isRequired,
  provider: PropTypes.string.isRequired,
  owner: PropTypes.string.isRequired,
}

export default SideMenu
