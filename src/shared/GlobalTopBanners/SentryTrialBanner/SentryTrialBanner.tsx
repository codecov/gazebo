import isNumber from 'lodash/isNumber'
import isUndefined from 'lodash/isUndefined'
import { useParams } from 'react-router-dom'

import { useAccountDetails, usePlans } from 'services/account'
import { findSentryPlans, isSentryPlan } from 'shared/utils/billing'
import A from 'ui/A'
import Button from 'ui/Button/Button'
import Icon from 'ui/Icon/Icon'
import TopBanner from 'ui/TopBanner'

const isOnSentryPlan = ({
  plans,
  planValue,
}: {
  /* TODO: update with plan type when 2044 is merged in */
  plans: any
  planValue: string
}) => {
  const { sentryPlanMonth, sentryPlanYear } = findSentryPlans({ plans })
  const alreadyOnSentryPlan = isSentryPlan(planValue)

  return (
    isUndefined(sentryPlanMonth) ||
    isUndefined(sentryPlanYear) ||
    alreadyOnSentryPlan
  )
}

interface UrlParams {
  provider: string
  owner: string | undefined
}

const SentryTrialBanner: React.FC = () => {
  const { provider, owner } = useParams<UrlParams>()
  const { data: plans } = usePlans()
  const { data: accountDetails } = useAccountDetails({
    provider,
    owner,
    opts: {
      enabled: !!owner,
    },
  })

  const trialEndTimestamp = accountDetails?.subscriptionDetail?.trialEnd ?? null

  if (
    isUndefined(owner) ||
    isNumber(trialEndTimestamp) ||
    isOnSentryPlan({
      plans,
      planValue: accountDetails?.plan?.value,
    })
  ) {
    return null
  }

  return (
    <TopBanner localStorageKey="global-top-sentry-banner">
      <TopBanner.Start>
        <p>
          <span className="font-semibold">
            Start your FREE Pro Team Sentry 14-day free trial today!
          </span>{' '}
          No credit card required -{' '}
          <A
            to={{ pageName: 'upgradeOrgPlan' }}
            isExternal={false}
            hook="sentry-trial-banner-to-upgrade-page"
            variant="semibold"
          >
            Start trial today
            <Icon size="sm" name="chevron-right" variant="solid" />
          </A>
        </p>
      </TopBanner.Start>
      <TopBanner.End>
        <p>
          <span className="font-semibold">Questions?</span> React out to{' '}
          {/* @ts-ignore-error */}
          <A
            to={{ pageName: 'support' }}
            hook="sentry-trial-banner-to-support"
            isExternal={true}
          />
        </p>
        <Button
          to={{ pageName: 'upgradeOrgPlan' }}
          hook="sentry-trial-banner-to-upgrade-page"
          disabled={false}
          variant="primary"
        >
          Start Trial
        </Button>
      </TopBanner.End>
    </TopBanner>
  )
}

export default SentryTrialBanner
