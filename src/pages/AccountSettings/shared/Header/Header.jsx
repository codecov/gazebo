import { useParams } from 'react-router-dom'

import config from 'config'

import MyContextSwitcher from 'layouts/MyContextSwitcher'
import TabNavigation from 'ui/TabNavigation'

function Header() {
  const { owner } = useParams()

  return (
    <>
      <MyContextSwitcher pageName="accountAdmin" activeContext={owner} />
      <div className="mt-4 mb-8">
        <TabNavigation
          tabs={[
            { pageName: 'owner', children: 'Repos' },
            { pageName: 'analytics', children: 'Analytics' },
            ...(config.IS_SELF_HOSTED
              ? []
              : [{ pageName: 'membersTab' }, { pageName: 'planTab' }]),
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
