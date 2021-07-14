import PropTypes from 'prop-types'
import A from 'ui/A'

import MyContextSwitcher from 'layouts/MyContextSwitcher'
import TabNavigation from 'ui/TabNavigation'

function Header({ currentUser }) {
  const { username, plan, planUserCount } = currentUser

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
        {plan === 'users-free' && (
          <div className="mx-4">
            {planUserCount === 0 ? (
              <span>
                Looks like you&#39;re up to 5 users.{' '}
                <A
                  to={{ pageName: 'upgradePlan' }}
                  options={{ owner: username }}
                  variant="link"
                >
                  Upgrade
                </A>{' '}
                plan today!
              </span>
            ) : planUserCount <= 5 ? (
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
  )
}

Header.propTypes = {
  currentUser: PropTypes.shape({
    username: PropTypes.string.isRequired,
    plan: PropTypes.string.isRequired,
    planUserCount: PropTypes.number.isRequired,
  }).isRequired,
}

export default Header
