import { useIsPersonalAccount } from 'services/useIsPersonalAccount'
import TabNavigation from 'ui/TabNavigation'

function Tabs() {
  const isUserPersonalAccount = useIsPersonalAccount()

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
        ...(!isUserPersonalAccount ? [{ pageName: 'planTab' }] : []),
        {
          pageName: 'accountAdmin',
          children: 'Settings',
        },
      ]}
    />
  )
}

export default Tabs
