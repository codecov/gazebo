import { useShouldRenderBillingTabs } from 'services/useShouldRenderBillingTabs'
import TabNavigation from 'ui/TabNavigation'

function Tabs() {
  const shouldRenderTabs = useShouldRenderBillingTabs()

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
        ...(shouldRenderTabs
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
