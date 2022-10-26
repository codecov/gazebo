import config from 'config'

import TabNavigation from 'ui/TabNavigation'

function Tabs() {
  return (
    <TabNavigation
      tabs={[
        {
          pageName: 'owner',
          children: 'Repos',
        },
        {
          pageName: 'analytics',
          children: 'Analytics',
        },
        ...(!config.IS_ENTERPRISE
          ? [{ pageName: 'membersTab' }, { pageName: 'planTab' }]
          : []),
        {
          pageName: 'accountAdmin',
          children: 'Settings',
        },
      ]}
    />
  )
}

export default Tabs
