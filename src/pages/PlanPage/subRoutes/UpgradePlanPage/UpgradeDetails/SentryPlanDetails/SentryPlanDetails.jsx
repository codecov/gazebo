import { useParams } from 'react-router-dom'

import sentryCodecov from 'assets/plan/sentry_codecov.svg'
import {
  useAccountDetails,
  useAvailablePlans,
  usePlanData,
} from 'services/account'
import BenefitList from 'shared/plan/BenefitList'
import { findSentryPlans } from 'shared/utils/billing'
import { SENTRY_PRICE, shouldRenderCancelLink } from 'shared/utils/upgradeForm'
import A from 'ui/A'
import Icon from 'ui/Icon'

function SentryPlanDetails() {
  const { provider, owner } = useParams()
  const { data: accountDetails } = useAccountDetails({ provider, owner })
  const { data: planData } = usePlanData({ provider, owner })
  const { data: plans } = useAvailablePlans({ provider, owner })
  const { sentryPlanMonth, sentryPlanYear } = findSentryPlans({ plans })

  const plan = accountDetails?.rootOrganization?.plan ?? accountDetails?.plan
  const cancelAtPeriodEnd =
    accountDetails?.subscriptionDetail?.cancelAtPeriodEnd
  const trialStatus = planData?.plan?.trialStatus

  return (
    <div className="flex flex-col gap-4 border p-4">
      <img src={sentryCodecov} alt="sentry codecov logos" width="110px" />
      <h3 className="text-2xl font-semibold text-ds-pink-quinary">
        {sentryPlanYear?.marketingName} plan
      </h3>
      <h2 className="text-4xl">
        ${SENTRY_PRICE}
        <span className="text-base">/monthly</span>
      </h2>
      <BenefitList
        iconName="check"
        iconColor="text-ds-pink-quinary"
        benefits={sentryPlanYear?.benefits}
      />
      <p className="text-ds-gray-quaternary">
        ${sentryPlanMonth?.baseUnitPrice} per user / month if paid monthly
      </p>
      {/* TODO: Note that there never was schedules shown here like it is in the pro plan details page. This
      is a bug imo and needs to be here in a future ticket */}
      {shouldRenderCancelLink(cancelAtPeriodEnd, plan, trialStatus) && (
        <A
          to={{ pageName: 'cancelOrgPlan' }}
          variant="black"
          hook="cancel-plan"
        >
          Cancel
          <Icon name="chevronRight" size="sm" variant="solid" />
        </A>
      )}
    </div>
  )
}
export default SentryPlanDetails
