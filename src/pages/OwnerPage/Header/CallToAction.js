import PropTypes from 'prop-types'
import A from 'ui/A'

function CallToAction({ accountDetails, owner }) {
  return (
    accountDetails?.plan?.value === 'users-free' && (
      <div className="mx-4 self-center">
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
    )
  )
}

CallToAction.propTypes = {
  owner: PropTypes.shape({
    username: PropTypes.string.isRequired,
  }).isRequired,
  accountDetails: PropTypes.shape({
    activatedUserCount: PropTypes.number.isRequired,
    plan: PropTypes.shape({
      value: PropTypes.string.isRequired,
    }).isRequired,
  }),
}

export default CallToAction
