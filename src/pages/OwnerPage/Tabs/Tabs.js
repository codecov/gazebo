import PropTypes from 'prop-types'

import { useShouldRenderBillingTabs } from 'services/useShouldRenderBillingTabs'
import TabNavigation from 'ui/TabNavigation'

import CallToAction from '../CallToAction'

function Tabs({ provider, owner }) {
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
      component={<CallToAction provider={provider} owner={owner.username} />}
    />
  )
}

Tabs.propTypes = {
  provider: PropTypes.string,
  owner: PropTypes.shape({ username: PropTypes.string }),
}

export default Tabs
