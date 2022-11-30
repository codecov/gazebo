import PropTypes from 'prop-types'
import { useContext } from 'react'

import config from 'config'

import { ActiveContext } from 'shared/context'
import TabNavigation from 'ui/TabNavigation'

function Tabs({ currentUsername }) {
  const active = useContext(ActiveContext)

  let tabs = [
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
    ...(config.IS_SELF_HOSTED
      ? []
      : [
          { pageName: 'membersTab', options: { owner: currentUsername } },
          { pageName: 'planTab', options: { owner: currentUsername } },
        ]),
    {
      pageName: 'accountAdmin',
      children: 'Settings',
      options: {
        owner: currentUsername,
      },
    },
  ]

  if (active) {
    tabs = [
      {
        pageName: 'provider',
        children: 'Repos',
      },
    ]
  }

  return <TabNavigation tabs={tabs} />
}

Tabs.propTypes = {
  currentUsername: PropTypes.string.isRequired,
}

export default Tabs
