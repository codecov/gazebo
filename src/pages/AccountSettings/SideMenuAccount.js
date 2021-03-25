import { useParams } from 'react-router-dom'

import { useUser } from 'services/user'

import Sidemenu from 'ui/Sidemenu'

function SideMenuAccount() {
  const { owner } = useParams()
  const { data: user } = useUser()
  const isPersonalSettings = user.username.toLowerCase() === owner.toLowerCase()

  return (
    // Need that extra div because the side menu gets stretched otherwise
    <div>
      <Sidemenu
        links={[
          { pageName: 'accountAdmin', exact: true },
          { pageName: isPersonalSettings ? 'accessTab' : 'billingAndUsers' },
          { pageName: 'yamlTab', children: 'Global Yaml' },
        ]}
      />
    </div>
  )
}

export default SideMenuAccount
