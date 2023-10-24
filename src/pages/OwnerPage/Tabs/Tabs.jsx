import PropTypes from 'prop-types'
import { lazy, Suspense } from 'react'
import { useParams } from 'react-router-dom'

import config from 'config'

import { TierNames, useTier } from 'services/tier'
import TabNavigation from 'ui/TabNavigation'

const TrialReminder = lazy(() => import('./TrialReminder'))

function Tabs() {
  const { owner, provider } = useParams()
  const { data: tierName } = useTier({ owner, provider })

  return (
    <TabNavigation
      tabs={[
        {
          pageName: 'owner',
          children: 'Repos',
        },
        ...(tierName === TierNames.TEAM
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
      component={
        <Suspense fallback={null}>
          <TrialReminder />
        </Suspense>
      }
    />
  )
}

Tabs.propTypes = {
  provider: PropTypes.string,
  owner: PropTypes.shape({ username: PropTypes.string }),
}

export default Tabs
