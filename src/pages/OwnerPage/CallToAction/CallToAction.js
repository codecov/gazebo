import PropTypes from 'prop-types'
import { useAccountDetails } from 'services/account'
import A from 'ui/A'
import { trackSegmentEvent } from 'services/tracking/segment'
import { isFreePlan } from 'shared/utils/billing'

function CallToAction({ provider, owner }) {
  const { data: accountDetails } = useAccountDetails({
    provider,
    owner,
    opts: {
      suspense: false,
    },
  })

  return isFreePlan(accountDetails?.plan?.value) ? (
    <div className="mx-4 self-center">
      {accountDetails.activatedUserCount === 5 ? (
        <span>
          Looks like you&#39;re up to 5 users.{' '}
          <A
            to={{ pageName: 'upgradePlan' }}
            options={{ owner: owner }}
            variant="link"
            onClick={() =>
              trackSegmentEvent({
                event: 'clicked button',
                label: 'upgrade plan',
                category: 'repo list cta',
              })
            }
          >
            Upgrade
          </A>{' '}
          plan today!
        </span>
      ) : accountDetails?.activatedUserCount < 5 ? (
        <span>
          Need more than 5 users?{' '}
          <A
            to={{ pageName: 'freeTrial' }}
            variant="link"
            onClick={() =>
              trackSegmentEvent({
                event: 'clicked button',
                label: 'request free trial',
                category: 'repo list cta',
              })
            }
          >
            Request
          </A>{' '}
          free trial
        </span>
      ) : null}
    </div>
  ) : null
}

CallToAction.propTypes = {
  owner: PropTypes.string.isRequired,
  provider: PropTypes.string.isRequired,
}

export default CallToAction
