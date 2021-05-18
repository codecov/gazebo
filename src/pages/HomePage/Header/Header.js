import PropTypes from 'prop-types'

import MyContextSwitcher from 'layouts/MyContextSwitcher'
import TabNavigation from 'ui/TabNavigation'
import { useUser } from 'services/user'

function Header({ owner }) {
  const { data: user } = useUser({
    suspense: false,
  })

  const ownerForLinks = owner || user.username

  return (
    <>
      <MyContextSwitcher
        pageName="ownerInternal"
        pageNameCurrentUser="providerInternal"
        activeContext={owner}
      />
      <div className="my-4">
        <TabNavigation
          tabs={[
            {
              pageName: owner ? 'ownerInternal' : 'providerInternal',
              children: 'Repos',
            },
            {
              pageName: 'analytics',
              children: 'Analytics',
              options: {
                owner: ownerForLinks,
              },
            },
            {
              pageName: 'accountAdmin',
              children: 'Settings',
              options: {
                owner: ownerForLinks,
              },
            },
          ]}
        />
      </div>
    </>
  )
}

Header.propTypes = {
  owner: PropTypes.string,
}

export default Header
