import PropTypes from 'prop-types'
import { NavLink } from 'react-router-dom'
import uniqueId from 'lodash/uniqueId'

import { useNavLinks } from 'services/navigation'
import Icon from 'ui/Icon'
import AppLink from 'ui/AppLink'

function SideMenu({ isPersonalSettings }) {
  const { accountAdmin, yamlTab, accessTab, billingAndUsers } = useNavLinks()
  const personalLinks = [
    {
      props: {
        to: accessTab.path(),
        useRouter: !accessTab.isExternalLink,
      },
      iconName: 'creditCard',
      text: accessTab.text,
    },
  ]

  const organizationLinks = [
    {
      props: {
        to: billingAndUsers.path(),
        useRouter: !billingAndUsers.isExternalLink,
      },
      iconName: 'creditCard',
      text: billingAndUsers.text,
    },
  ]

  const links = [
    {
      props: {
        to: accountAdmin.path(),
        useRouter: !accountAdmin.isExternalLink,
        exact: true,
      },
      iconName: 'setting',
      text: accountAdmin.text,
    },
    ...(isPersonalSettings ? personalLinks : organizationLinks),
    {
      props: {
        to: yamlTab.path(),
        useRouter: !yamlTab.isExternalLink,
      },
      iconName: 'fileAlt',
      text: yamlTab.text,
    },
  ]

  return (
    <aside>
      <section className="flex flex-row lg:flex-col">
        {links.map((link) => (
          <AppLink
            className="flex-1 flex tems-center text-gray-500 p-2 pr-2 mb-2 border-solid border-pink-500 hover:bg-gray-100"
            activeClassName="border-b-4 lg:border-b-0 lg:border-r-4"
            Component={NavLink}
            key={uniqueId(link.text)}
            {...link.props}
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
  isPersonalSettings: PropTypes.bool.isRequired,
}

export default SideMenu
