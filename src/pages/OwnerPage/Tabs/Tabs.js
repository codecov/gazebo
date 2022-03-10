import PropTypes from 'prop-types'

import { useIsCurrentUserAnAdmin } from 'services/user'
import TabNavigation from 'ui/TabNavigation'

import CallToAction from '../CallToAction'

function Tabs({ provider, owner }) {
  const isAdmin = useIsCurrentUserAnAdmin({ owner: owner?.username })

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
      component={<CallToAction provider={provider} owner={owner.username} />}
    />
  )
}

Tabs.propTypes = {
  provider: PropTypes.string,
  owner: PropTypes.shape({ username: PropTypes.string }),
}

export default Tabs
