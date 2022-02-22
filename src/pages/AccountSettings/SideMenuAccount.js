import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useIsCurrentUserAnAdmin, useUser } from 'services/user'
import Sidemenu from 'ui/Sidemenu'

function SideMenuAccount() {
  const { provider, owner } = useParams()

  const { data: currentUser } = useUser()
  const isAdmin = useIsCurrentUserAnAdmin({ owner })

  useEffect(() => {
    if (!isAdmin) window.location.replace(`/${provider}/${owner}`) //to be fixed why not redirect && how to test
  }, [isAdmin, provider, owner])

  const isPersonalSettings =
    currentUser.user.username.toLowerCase() === owner.toLowerCase()

  return (
    // Need that extra div because the side menu gets stretched otherwise
    <div>
      <Sidemenu
        links={[
          { pageName: 'accountAdmin', exact: true },
          {
            pageName: isPersonalSettings
              ? 'internalAccessTab'
              : 'billingAndUsers',
          },
          { pageName: 'yamlTab' },
        ]}
      />
    </div>
  )
}

export default SideMenuAccount
