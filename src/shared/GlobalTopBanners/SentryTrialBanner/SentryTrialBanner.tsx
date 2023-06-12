import isNumber from 'lodash/isNumber'
import isUndefined from 'lodash/isUndefined'
import { useParams } from 'react-router-dom'

import { useAccountDetails, usePlans } from 'services/account'
import { findSentryPlans, isSentryPlan } from 'shared/utils/billing'
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
  const { data: plans } = usePlans(provider)
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
    <TopBanner
      localStorageKey="global-top-sentry-banner"
      variant={'excitement'}
    >
      <TopBanner.Start>
        <p>
          <span className="font-semibold">
            Start your 14-day free Codecov Pro trial today.
          </span>{' '}
          No credit card required.
        </p>
      </TopBanner.Start>
      <TopBanner.End>
        <Button
          to={{ pageName: 'allOrgsPlanPage' }}
          hook="sentry-trial-banner-to-upgrade-page"
          disabled={false}
          variant="primary"
        >
          Start Trial
        </Button>
        <TopBanner.DismissButton>
          <Icon size="sm" variant="solid" name="x" />
        </TopBanner.DismissButton>
      </TopBanner.End>
    </TopBanner>
  )
}

export default SentryTrialBanner
