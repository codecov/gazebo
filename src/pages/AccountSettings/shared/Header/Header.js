import { useParams } from 'react-router-dom'

import MyContextSwitcher from 'layouts/MyContextSwitcher'
import { useFlags } from 'shared/featureFlags'
import TabNavigation from 'ui/TabNavigation'

function Header() {
  const { owner } = useParams()
  const { gazeboPlanTab } = useFlags({
    gazeboPlanTab: false,
  })

  return (
    <>
      <MyContextSwitcher pageName="accountAdmin" activeContext={owner} />
      <div className="mt-4 mb-8">
        <TabNavigation
          tabs={[
            { pageName: 'owner', children: 'Repos' },
            { pageName: 'analytics', children: 'Analytics' },
            ...(gazeboPlanTab
              ? [{ pageName: 'membersTab' }, { pageName: 'planTab' }]
              : []),
            {
              pageName: 'accountAdmin',
              children: 'Settings',
            },
          ]}
        />
      </div>
    </>
  )
}

export default Header
