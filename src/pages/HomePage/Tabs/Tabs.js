import PropTypes from 'prop-types'

import TabNavigation from 'ui/TabNavigation'

function Tabs({ currentUsername }) {
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
