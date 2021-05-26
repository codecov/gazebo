import PropTypes from 'prop-types'

import MyContextSwitcher from 'layouts/MyContextSwitcher'
import TabNavigation from 'ui/TabNavigation'

function Header({ currentUsername }) {
  return (
    <>
      <MyContextSwitcher
        pageName="ownerInternal"
        pageNameCurrentUser="providerInternal"
        activeContext={currentUsername}
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
                owner: currentUsername.username,
              },
            },
            {
              pageName: 'accountAdmin',
              children: 'Settings',
              options: {
                owner: currentUsername.username,
              },
            },
          ]}
        />
      </div>
    </>
  )
}

Header.propTypes = {
  currentUsername: PropTypes.string.isRequired,
}

export default Header
