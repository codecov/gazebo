import TabNavigation from 'ui/TabNavigation'
import { useIsCurrentUserAnAdmin } from 'services/user'
import { useParams } from 'react-router-dom'

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
          pageName: isAdmin && 'accountAdmin',
          children: 'Settings',
        },
      ]}
    />
  )
}

export default Tabs
