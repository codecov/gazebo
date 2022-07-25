import { useFlags } from 'shared/featureFlags'
import TabNavigation from 'ui/TabNavigation'

function Tabs() {
  const { gazeboBillingsTab } = useFlags({
    gazeboBillingsTab: false,
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
        ...(gazeboBillingsTab ? [{ pageName: 'billingTab' }] : []),
        {
          pageName: 'accountAdmin',
          children: 'Settings',
        },
      ]}
    />
  )
}

export default Tabs
