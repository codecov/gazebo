import PropTypes from 'prop-types'

import MyContextSwitcher from 'layouts/MyContextSwitcher'
import TabNavigation from 'ui/TabNavigation'

function Header({ owner }) {
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
            { pageName: 'analytics', children: 'Analytics' },
            { pageName: 'accountAdmin', children: 'Settings' },
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
