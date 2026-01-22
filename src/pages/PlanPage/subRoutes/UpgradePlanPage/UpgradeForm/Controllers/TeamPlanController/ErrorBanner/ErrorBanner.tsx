import { UseFormSetValue } from 'react-hook-form'
import { useParams } from 'react-router-dom'

import {
  IndividualPlan,
  useAvailablePlans,
} from 'services/account/useAvailablePlans'
import { usePlanData } from 'services/account/usePlanData'
import { useLocationParams } from 'services/navigation/useLocationParams'
import {
  BillingRate,
  canApplySentryUpgrade,
  findProPlans,
  findSentryPlans,
  TierNames,
} from 'shared/utils/billing'
import { UPGRADE_FORM_TOO_MANY_SEATS_MESSAGE } from 'shared/utils/upgradeForm'

import { UpgradeFormFields } from '../../../UpgradeForm'

interface Errors {
  seats?: {
    message?: string
  }
}

interface ErrorBannerProps {
  errors: Errors
  setFormValue: UseFormSetValue<UpgradeFormFields>
  setSelectedPlan: (plan?: IndividualPlan) => void
}

export default function ErrorBanner({
  errors,
  setFormValue,
  setSelectedPlan,
}: ErrorBannerProps) {
  const { provider, owner } = useParams<{ provider: string; owner: string }>()
  const { updateParams } = useLocationParams({ plan: null })
  const { data: plans } = useAvailablePlans({ provider, owner })
  const { data: planData } = usePlanData({ provider, owner })
  const { proPlanYear, proPlanMonth } = findProPlans({ plans })
  const { sentryPlanYear, sentryPlanMonth } = findSentryPlans({ plans })
  const isSentryUpgrade = canApplySentryUpgrade({
    isEnterprisePlan: planData?.plan?.isEnterprisePlan,
    plans,
  })
  const isYearlyPlan = planData?.plan?.billingRate === BillingRate.ANNUALLY

  // Only show yearly plan if current plan is yearly
  const proPlan = isYearlyPlan
    ? isSentryUpgrade
      ? sentryPlanYear
      : proPlanYear
    : isSentryUpgrade
      ? sentryPlanMonth
      : proPlanMonth

  if (
    errors?.seats?.message === UPGRADE_FORM_TOO_MANY_SEATS_MESSAGE &&
    proPlan
  ) {
    return (
      <div
        className="rounded-md bg-ds-error-quinary p-3 text-ds-error-nonary"
        data-testid="team-plan-upgrade-error-banner"
      >
        &#128161; {errors.seats.message}{' '}
        <button
          className="cursor-pointer font-semibold text-ds-blue-darker hover:underline"
          onClick={() => {
            setSelectedPlan(proPlan)
            setFormValue('newPlan', proPlan, {
              shouldValidate: true,
            })
            // without this line, the tier selector won't update
            updateParams({ plan: TierNames.PRO })
          }}
        >
          Upgrade to Pro
        </button>
      </div>
    )
  }

  return (
    <p
      className="rounded-md bg-ds-error-quinary p-3 text-ds-error-nonary"
      data-testid="team-plan-upgrade-error-banner"
    >
      {errors?.seats?.message}
    </p>
  )
}
