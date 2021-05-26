import PropTypes from 'prop-types'

import MyContextSwitcher from 'layouts/MyContextSwitcher'
import TabNavigation from 'ui/TabNavigation'
import Avatar from 'ui/Avatar'

function Header({ owner }) {
  return owner.isCurrentUserPartOfOrg ? (
    <>
      <MyContextSwitcher
        pageName="ownerInternal"
        pageNameCurrentUser="providerInternal"
        activeContext={owner.username}
      />
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
    </>
  ) : (
    <div className="flex items-center">
      <Avatar user={owner} bordered />
      <h2 className="mx-2 text-xl font-semibold">{owner.username}</h2>
    </div>
  )
}

Header.propTypes = {
  owner: PropTypes.string,
}

export default Header
