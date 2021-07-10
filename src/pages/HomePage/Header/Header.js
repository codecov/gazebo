import PropTypes from 'prop-types'
import AppLink from 'shared/AppLink'
import { useNavLinks } from 'services/navigation'

import MyContextSwitcher from 'layouts/MyContextSwitcher'
import TabNavigation from 'ui/TabNavigation'

function Header({ currentUser }) {
  const { username, plan, planUserCount } = currentUser
  const { upgradePlan } = useNavLinks()

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
        <div className="mx-4">
          {plan === 'users-free' && planUserCount === 0 ? (
            <span>
              Looks like you&#39;re up to 5 users.{' '}
              <a
                href={upgradePlan.path({
                  owner: username,
                })}
                className="text-ds-blue-darker hover:underline focus:ring-2"
              >
                Upgrade
              </a>{' '}
              plan today!
            </span>
          ) : plan === 'users-free' && planUserCount <= 5 ? (
            <span>
              Need more than 5 users?{' '}
              <AppLink
                pageName="trial"
                className="text-ds-blue-darker hover:underline focus:ring-2"
              >
                Request
              </AppLink>{' '}
              free trial
            </span>
          ) : null}
        </div>
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
