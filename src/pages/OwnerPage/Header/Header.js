import PropTypes from 'prop-types'

import MyContextSwitcher from 'layouts/MyContextSwitcher'
import TabNavigation from 'ui/TabNavigation'
import AppLink from 'shared/AppLink'
import { useNavLinks } from 'services/navigation'
import Avatar from 'ui/Avatar'

function Header({ owner, currentUser }) {
  const { username, plan, planUserCount } = currentUser
  const { upgradePlan } = useNavLinks()

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
              children: 'Settingss',
            },
          ]}
        />
        {plan === 'users-free' && (
          <div className="mx-4">
            {planUserCount === 0 ? (
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
            ) : planUserCount === 5 ? (
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
  currentUser: PropTypes.shape({
    username: PropTypes.string.isRequired,
    plan: PropTypes.string.isRequired,
    planUserCount: PropTypes.number.isRequired,
  }).isRequired,
}

export default Header
