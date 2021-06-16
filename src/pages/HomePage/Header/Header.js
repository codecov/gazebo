import PropTypes from 'prop-types'

import MyContextSwitcher from 'layouts/MyContextSwitcher'
import TabNavigation from 'ui/TabNavigation'

function Header({ currentUsername }) {
  return (
    <>
      <MyContextSwitcher pageName="owner" activeContext={null} />
      <div className="my-4">
        <TabNavigation
          tabs={[
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
            {
              pageName: 'accountAdmin',
              children: 'Settings',
              options: {
                owner: currentUsername,
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
