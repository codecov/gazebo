import { useParams } from 'react-router-dom'

import { useIsCurrentUserAnAdmin, useUser } from 'services/user'
import { useFlags } from 'shared/featureFlags'
import Sidemenu from 'ui/Sidemenu'

function SideMenuAccount() {
  const { owner } = useParams()
  const { gazeboPlanTab: gazeboPlanTabFlag } = useFlags({
    gazeboPlanTab: false,
  })
  const shouldRenderBillingTab = !gazeboPlanTabFlag && 'billingAndUsers'

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
                  pageName: isPersonalSettings
                    ? 'internalAccessTab'
                    : shouldRenderBillingTab,
                },
                { pageName: 'yamlTab' },
              ]
            : [
                {
                  pageName: isPersonalSettings
                    ? 'internalAccessTab'
                    : shouldRenderBillingTab,
                },
                { pageName: 'yamlTab' },
              ]
        }
      />
    </div>
  )
}

export default SideMenuAccount
