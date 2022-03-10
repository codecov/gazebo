import { useParams } from 'react-router-dom'

import MyContextSwitcher from 'layouts/MyContextSwitcher'
import { useIsCurrentUserAnAdmin } from 'services/user'
import TabNavigation from 'ui/TabNavigation'

function Header() {
  const { owner } = useParams()
  const isAdmin = useIsCurrentUserAnAdmin({ owner })

  return (
    <>
      <MyContextSwitcher pageName="accountAdmin" activeContext={owner} />
      <div className="mt-4 mb-8">
        <TabNavigation
          tabs={[
            { pageName: 'owner', children: 'Repos' },
            { pageName: 'analytics', children: 'Analytics' },
            {
              pageName: isAdmin ? 'accountAdmin' : 'billingAndUsers',
              children: 'Settings',
            },
          ]}
        />
      </div>
    </>
  )
}

export default Header
