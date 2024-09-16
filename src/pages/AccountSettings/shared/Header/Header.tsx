import config from 'config'

import { useFlags } from 'shared/featureFlags'
import Badge from 'ui/Badge'
import TabNavigation from 'ui/TabNavigation'

function Header() {
  const { codecovAiFeaturesTab } = useFlags({
    codecovAiFeaturesTab: false,
  })

  return (
    <TabNavigation
      tabs={[
        { pageName: 'owner', children: 'Repos' },
        { pageName: 'analytics', children: 'Analytics' },
        ...(codecovAiFeaturesTab
          ? [
              {
                pageName: 'codecovAI',
                children: (
                  <>
                    Codecov AI <Badge>beta</Badge>{' '}
                  </>
                ),
              },
            ]
          : []),
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
