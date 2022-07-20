import PropTypes from 'prop-types'

import TabNavigation from 'ui/TabNavigation'
import { useFlags } from 'shared/featureFlags'

import CallToAction from '../CallToAction'

function Tabs({ provider, owner }) {
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
      component={<CallToAction provider={provider} owner={owner.username} />}
    />
  )
}

Tabs.propTypes = {
  provider: PropTypes.string,
  owner: PropTypes.shape({ username: PropTypes.string }),
}

export default Tabs
