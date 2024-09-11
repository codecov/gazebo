import PropTypes from 'prop-types'
import { lazy, Suspense } from 'react'

import config from 'config'

import Badge from 'ui/Badge'
import TabNavigation from 'ui/TabNavigation'

const TrialReminder = lazy(() => import('./TrialReminder'))

function Tabs() {
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
          pageName: 'codecovAI',
          children: (
            <>
              Codecov AI <Badge>beta</Badge>{' '}
            </>
          ),
        },
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
