import { useParams } from 'react-router-dom'

import MyContextSwitcher from 'layouts/MyContextSwitcher'
import TabNavigation from 'ui/TabNavigation'

function Header() {
  const { owner } = useParams()

  return (
    <>
      <MyContextSwitcher pageName="owner" activeContext={owner} />
      <div className="my-4">
        <TabNavigation
          tabs={[
            { pageName: 'owner', children: 'Repos' },
            { pageName: 'analytics', children: 'Analytics' },
            { pageName: 'accountAdmin', children: 'Settings' },
          ]}
        />
      </div>
    </>
  )
}

export default Header
