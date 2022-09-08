import { useParams } from 'react-router-dom'

import config from 'config'

import { useIsCurrentUserAnAdmin, useUser } from 'services/user'
import Sidemenu from 'ui/Sidemenu'

function AccountSettingsSideMenu() {
  const { owner } = useParams()

  const { data: currentUser } = useUser()
  const isAdmin = useIsCurrentUserAnAdmin({ owner })

  const isPersonalSettings =
    currentUser.user.username.toLowerCase() === owner.toLowerCase()

  let links = [
    {
      pageName: isPersonalSettings ? 'internalAccessTab' : '',
    },
    { pageName: 'yamlTab' },
  ]

  if (config.IS_ENTERPRISE) {
    links = [{ pageName: 'yamlTab' }]
  } else if (isAdmin) {
    links = [
      {
        pageName: 'accountAdmin',
        exact: true,
      },
      {
        pageName: isPersonalSettings ? 'internalAccessTab' : '',
      },
      { pageName: 'yamlTab' },
    ]
  }

  return (
    // Need that extra div because the side menu gets stretched otherwise
    <div>
      <Sidemenu links={links} />
    </div>
  )
}

export default AccountSettingsSideMenu
