import config from 'config'

import MyContextSwitcher from 'layouts/MyContextSwitcher'
import { useFlags } from 'shared/featureFlags'
import { cn } from 'shared/utils/cn'
import TabNavigation from 'ui/TabNavigation'

function Header() {
  const { newHeader } = useFlags({
    newHeader: false,
  })

  return (
    <div className={cn({ 'mt-2': !newHeader })}>
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
    </div>
  )
}

export default Header
