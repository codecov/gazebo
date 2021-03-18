import { NavLink, useParams } from 'react-router-dom'
import uniqueId from 'lodash/uniqueId'

import { useNavLinks } from 'services/navigation'
import { useUser } from 'services/user'
import Icon from 'old_ui/Icon'
import AppLink from 'old_ui/AppLink'

function SideMenu() {
  const { owner } = useParams()
  const { accountAdmin, yamlTab, accessTab, billingAndUsers } = useNavLinks()
  const { data: user } = useUser()
  const isPersonalSettings = user.username.toLowerCase() === owner.toLowerCase()

  const personalLinks = [
    {
      to: accessTab.path(),
      useRouter: !accessTab.isExternalLink,
      iconName: 'creditCard',
      text: accessTab.text,
    },
  ]

  const organizationLinks = [
    {
      to: billingAndUsers.path(),
      useRouter: !billingAndUsers.isExternalLink,
      iconName: 'creditCard',
      text: billingAndUsers.text,
    },
  ]

  const links = [
    {
      to: accountAdmin.path(),
      useRouter: !accountAdmin.isExternalLink,
      exact: true,
      iconName: 'setting',
      text: accountAdmin.text,
    },
    ...(isPersonalSettings ? personalLinks : organizationLinks),
    {
      to: yamlTab.path(),
      useRouter: !yamlTab.isExternalLink,
      iconName: 'fileAlt',
      text: yamlTab.text,
    },
  ]

  return (
    <aside>
      <section className="flex flex-row lg:flex-col">
        {links.map(({ useRouter, exact, text, iconName, ...props }) => {
          const activeProps = useRouter && {
            activeClassName: 'border-b-4 lg:border-b-0 lg:border-r-4',
            exact: exact,
          }

          return (
            <AppLink
              className="flex-1 flex tems-center text-gray-500 p-2 pr-2 mb-2 border-solid border-pink-500 hover:bg-gray-100"
              Component={NavLink}
              key={uniqueId(text)}
              useRouter={useRouter}
              {...activeProps}
              {...props}
            >
              <Icon name={iconName} className="mr-1" />
              {text}
            </AppLink>
          )
        })}
      </section>
    </aside>
  )
}

export default SideMenu
