import { useShouldRenderTabs } from 'services/useShouldRenderTabs'
import TabNavigation from 'ui/TabNavigation'

function Tabs() {
  const shouldRenderTabs = useShouldRenderTabs()


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
        ...(shouldRenderTabs? [{ pageName: 'membersTab' }, { pageName: 'planTab' }] : []),
        {
          pageName: 'accountAdmin',
          children: 'Settings',
        },
      ]}
    />
  )
}

export default Tabs
