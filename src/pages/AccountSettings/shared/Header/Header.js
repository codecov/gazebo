import { useParams } from 'react-router-dom'

import MyContextSwitcher from 'layouts/MyContextSwitcher'
import TabNavigation from 'ui/TabNavigation'
import { useFlags } from 'shared/featureFlags'

function Header() {
  const { owner } = useParams()
  const { gazeboBillingsTab } = useFlags({
    gazeboBillingsTab: false,
  })

  return (
    <>
      <MyContextSwitcher pageName="accountAdmin" activeContext={owner} />
      <div className="mt-4 mb-8">
        <TabNavigation
          tabs={[
            { pageName: 'owner', children: 'Repos' },
            { pageName: 'analytics', children: 'Analytics' },
            ...(gazeboBillingsTab ? [{ pageName: 'billingTab' }] : []),
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
