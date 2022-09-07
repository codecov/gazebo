import { useParams } from 'react-router-dom'

import { useIsCurrentUserAnAdmin, useUser } from 'services/user'
import Sidemenu from 'ui/Sidemenu'

function SideMenuAccount() {
  const { owner } = useParams()

  const { data: currentUser } = useUser()
  const isAdmin = useIsCurrentUserAnAdmin({ owner })

  const isPersonalSettings =
    currentUser.user.username.toLowerCase() === owner.toLowerCase()

  return (
    // Need that extra div because the side menu gets stretched otherwise
    <div>
      <Sidemenu
        links={
          isAdmin
            ? [
                {
                  pageName: 'accountAdmin',
                  exact: true,
                },
                {
                  pageName: isPersonalSettings ? 'internalAccessTab' : '',
                },
                { pageName: 'yamlTab' },
              ]
            : [
                {
                  pageName: isPersonalSettings ? 'internalAccessTab' : '',
                },
                { pageName: 'yamlTab' },
              ]
        }
      />
    </div>
  )
}

export default SideMenuAccount
