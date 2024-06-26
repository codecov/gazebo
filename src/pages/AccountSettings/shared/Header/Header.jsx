import config from 'config'

import MyContextSwitcher from 'layouts/MyContextSwitcher'
import { useFlags } from 'shared/featureFlags'
import TabNavigation from 'ui/TabNavigation'

function Header() {
  const { newHeader } = useFlags({
    newHeader: false,
  })

  return (
    <>
      {newHeader ? null : <MyContextSwitcher pageName="accountAdmin" />}
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
    </>
  )
}

export default Header
