import PropTypes from 'prop-types'

import MyContextSwitcher from 'layouts/MyContextSwitcher'
import TabNavigation from 'ui/TabNavigation'
import Avatar from 'ui/Avatar'
import { useUser } from 'services/user'

function Header({ owner }) {
  const { data: user } = useUser({
    suspense: false,
  })

  return (
    <>
      {user ? (
        <MyContextSwitcher
          pageName="ownerInternal"
          pageNameCurrentUser="providerInternal"
          activeContext={owner.username}
        />
      ) : (
        <div className="flex items-center">
          <Avatar user={owner} bordered />
          <h2 className="mx-2 text-xl font-semibold">{owner.username}</h2>
        </div>
      )}
      {owner.isCurrentUserPartOfOrg && (
        <div className="my-4">
          <TabNavigation
            tabs={[
              {
                pageName: 'ownerInternal',
                children: 'Repos',
              },
              {
                pageName: 'analytics',
                children: 'Analytics',
              },
              {
                pageName: 'accountAdmin',
                children: 'Settings',
              },
            ]}
          />
        </div>
      )}
    </>
  )
}

Header.propTypes = {
  owner: PropTypes.string,
}

export default Header
