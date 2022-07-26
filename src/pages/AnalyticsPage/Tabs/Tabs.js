import { useIsPersonalAccount } from 'services/useIsPersonalAccount'
import TabNavigation from 'ui/TabNavigation'

function Tabs() {
  const shouldRenderPlanTab = useIsPersonalAccount()

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
        ...(shouldRenderPlanTab ? [{ pageName: 'planTab' }] : []),
        {
          pageName: 'accountAdmin',
          children: 'Settings',
        },
      ]}
    />
  )
}

export default Tabs
