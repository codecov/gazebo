import PropTypes from 'prop-types'

import { useFlags } from 'shared/featureFlags'
import TabNavigation from 'ui/TabNavigation'

function Tabs({ currentUsername }) {
  const { gazeboBillingsTab } = useFlags({
    gazeboBillingsTab: false,
  })

  return (
    <TabNavigation
      tabs={[
        {
          pageName: 'provider',
          children: 'Repos',
        },
        {
          pageName: 'analytics',
          children: 'Analytics',
          options: {
            owner: currentUsername,
          },
        },
        ...(gazeboBillingsTab
          ? [
              {
                pageName: 'billingTab',
                options: {
                  owner: currentUsername,
                },
              },
            ]
          : []),

        {
          pageName: 'accountAdmin',
          children: 'Settings',
          options: {
            owner: currentUsername,
          },
        },
      ]}
    />
  )
}

Tabs.propTypes = {
  currentUsername: PropTypes.string.isRequired,
}

export default Tabs
