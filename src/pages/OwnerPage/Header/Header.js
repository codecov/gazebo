import PropTypes from 'prop-types'

import MyContextSwitcher from 'layouts/MyContextSwitcher'
import TabNavigation from 'ui/TabNavigation'
import A from 'ui/A'
import Avatar from 'ui/Avatar'

function Header({ owner, accountDetails }) {
  return owner.isCurrentUserPartOfOrg ? (
    <>
      <MyContextSwitcher pageName="owner" activeContext={owner.username} />
      <div className="my-4 border-b border-ds-gray-tertiary flex items-center justify-between">
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
        />
        {accountDetails?.plan?.value === 'users-free' && (
          <div className="mx-4">
            {accountDetails.activatedUserCount === 5 ? (
              <span>
                Looks like you&#39;re up to 5 users.{' '}
                <A
                  to={{ pageName: 'upgradePlan' }}
                  options={{ owner: owner.username }}
                  variant="link"
                >
                  Upgrade
                </A>{' '}
                plan today!
              </span>
            ) : accountDetails?.activatedUserCount < 5 ? (
              <span>
                Need more than 5 users?{' '}
                <A to={{ pageName: 'freeTrial' }} variant="link">
                  Request
                </A>{' '}
                free trial
              </span>
            ) : null}
          </div>
        )}
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
