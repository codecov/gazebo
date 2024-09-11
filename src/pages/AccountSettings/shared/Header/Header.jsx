import config from 'config'

import Badge from 'ui/Badge'
import TabNavigation from 'ui/TabNavigation'

function Header() {
  return (
    <TabNavigation
      tabs={[
        { pageName: 'owner', children: 'Repos' },
        { pageName: 'analytics', children: 'Analytics' },
        {
          pageName: 'codecovAI',
          children: (
            <>
              Codecov AI <Badge>beta</Badge>{' '}
            </>
          ),
        },
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
