import { useParams } from 'react-router-dom'

import config from 'config'

import MyContextSwitcher from 'layouts/MyContextSwitcher'
import { TierNames, useTier } from 'services/tier'
import TabNavigation from 'ui/TabNavigation'

function Header() {
  const { owner, provider } = useParams()
  const { data: tierName } = useTier({ owner, provider })
  return (
    <>
      <MyContextSwitcher pageName="accountAdmin" />
      <TabNavigation
        tabs={[
          { pageName: 'owner', children: 'Repos' },
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
      />
    </>
  )
}

export default Header
