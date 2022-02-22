import PropTypes from 'prop-types'
import TabNavigation from 'ui/TabNavigation'

import CallToAction from '../CallToAction'
import { useIsCurrentUserAnAdmin } from 'services/user'

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
          pageName: isAdmin && 'accountAdmin',
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
