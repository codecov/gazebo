import config from 'config'

import TabNavigation from 'ui/TabNavigation'

function Header() {
  return (
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
  )
}

export default Header
