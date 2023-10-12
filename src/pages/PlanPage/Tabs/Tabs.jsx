import { useParams } from 'react-router-dom'

import config from 'config'

import { TierNames, useTier } from 'services/tier'
import { useFlags } from 'shared/featureFlags'
import TabNavigation from 'ui/TabNavigation'

function Tabs() {
  const { owner, provider } = useParams()
  const { data: tierName } = useTier({ owner, provider })
  const { multipleTiers: isTeamTier } = useFlags({
    multipleTiers: true,
  })

  return (
    <TabNavigation
      tabs={[
        {
          pageName: 'owner',
          children: 'Repos',
        },
        ...(tierName === TierNames.TEAM && isTeamTier
          ? []
          : [
              {
                pageName: 'analytics',
                children: 'Analytics',
              },
            ]),
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

export default Tabs
