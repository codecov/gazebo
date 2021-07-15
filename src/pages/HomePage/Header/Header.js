import PropTypes from 'prop-types'

import MyContextSwitcher from 'layouts/MyContextSwitcher'
import TabNavigation from 'ui/TabNavigation'

function Header({ currentUser }) {
  const { username } = currentUser

  return (
    <>
      <MyContextSwitcher pageName="owner" activeContext={null} />
      <div className="my-4 border-b border-ds-gray-tertiary flex items-center justify-between">
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
                owner: username,
              },
            },
            {
              pageName: 'accountAdmin',
              children: 'Settings',
              options: {
                owner: username,
              },
            },
          ]}
        />
      </div>
    </>
  )
}

Header.propTypes = {
  currentUser: PropTypes.shape({
    username: PropTypes.string.isRequired,
  }).isRequired,
}

export default Header
