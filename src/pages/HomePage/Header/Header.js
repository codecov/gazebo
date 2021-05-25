import MyContextSwitcher from 'layouts/MyContextSwitcher'
import TabNavigation from 'ui/TabNavigation'
import { useUser } from 'services/user'

function Header() {
  const { data: user } = useUser({
    suspense: false,
  })

  return (
    <>
      <MyContextSwitcher
        pageName="ownerInternal"
        pageNameCurrentUser="providerInternal"
        activeContext={user}
      />
      <div className="my-4">
        <TabNavigation
          tabs={[
            {
              pageName: 'providerInternal',
              children: 'Repos',
            },
            {
              pageName: 'analytics',
              children: 'Analytics',
              options: {
                owner: user.username,
              },
            },
            {
              pageName: 'accountAdmin',
              children: 'Settings',
              options: {
                owner: user.username,
              },
            },
          ]}
        />
      </div>
    </>
  )
}

export default Header
