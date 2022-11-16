import { useParams } from 'react-router-dom'

import config from 'config'

import { useIsCurrentUserAnAdmin, useUser } from 'services/user'
import Sidemenu from 'ui/Sidemenu'

const generateLinks = ({ isAdmin, isPersonalSettings }) => {
  const internalAccessTab = isPersonalSettings ? 'internalAccessTab' : ''

  let links = [
    {
      pageName: internalAccessTab,
    },
    { pageName: 'yamlTab' },
  ]

  if (config?.IS_SELF_HOSTED) {
    links = [
      { pageName: isPersonalSettings ? 'profile' : '', exact: true },
      { pageName: 'yamlTab' },
    ]
  } else if (isAdmin) {
    links = [
      {
        pageName: 'accountAdmin',
        exact: true,
      },
      {
        pageName: internalAccessTab,
      },
      { pageName: 'yamlTab' },
    ]
  }

  return links
}

function AccountSettingsSideMenu() {
  const { owner } = useParams()

  const { data: currentUser } = useUser()
  const isAdmin = useIsCurrentUserAnAdmin({ owner })

  const isPersonalSettings =
    currentUser?.user?.username?.toLowerCase() === owner?.toLowerCase()

  const links = generateLinks({ isAdmin, isPersonalSettings })

  return <Sidemenu links={links} />
}

export default AccountSettingsSideMenu
