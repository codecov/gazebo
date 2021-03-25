import { useParams } from 'react-router-dom'

import MyContextSwitcher from 'layouts/MyContextSwitcher'
import TabNavigation from 'ui/TabNavigation'

function Header() {
  const { owner } = useParams()

  return (
    <>
      <MyContextSwitcher pageName="ownerInternal" activeContext={owner} />
      <div className="my-4">
        <TabNavigation
          tabs={[
            { pageName: 'ownerInternal', children: 'Repos' },
            { pageName: 'accountAdmin', children: 'Settings' },
          ]}
        />
      </div>
    </>
  )
}

export default Header
