import { useFlags } from 'shared/featureFlags'
import TabNavigation from 'ui/TabNavigation'

function Tabs() {
  const { gazeboPlanTab } = useFlags({
    gazeboPlanTab: false,
  })

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
        ...(gazeboPlanTab
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
