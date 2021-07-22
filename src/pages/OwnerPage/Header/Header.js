import PropTypes from 'prop-types'

import MyContextSwitcher from 'layouts/MyContextSwitcher'
import TabNavigation from 'ui/TabNavigation'
import Avatar from 'ui/Avatar'
import CallToAction from './CallToAction'
function Header({ owner, accountDetails }) {
  return owner.isCurrentUserPartOfOrg ? (
    <>
      <MyContextSwitcher pageName="owner" activeContext={owner.username} />
      <div className="my-4">
        <TabNavigation
          tabs={[
            {
              pageName: 'owner',
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
          component={
            <CallToAction accountDetails={accountDetails} owner={owner} />
          }
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
  owner: PropTypes.shape({
    username: PropTypes.string.isRequired,
    isCurrentUserPartOfOrg: PropTypes.bool.isRequired,
  }).isRequired,
  accountDetails: PropTypes.shape({
    activatedUserCount: PropTypes.number.isRequired,
    plan: PropTypes.shape({
      value: PropTypes.string.isRequired,
    }).isRequired,
  }),
}

export default Header
