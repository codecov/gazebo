import { useParams } from 'react-router-dom'

import { useIsCurrentUserAnAdmin } from 'services/user'
import TabNavigation from 'ui/TabNavigation'

function Tabs() {
  const { owner } = useParams()
  const isAdmin = useIsCurrentUserAnAdmin({ owner })

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
        {
          pageName: isAdmin ? 'accountAdmin' : 'billingAndUsers',
          children: 'Settings',
        },
      ]}
    />
  )
}

export default Tabs
