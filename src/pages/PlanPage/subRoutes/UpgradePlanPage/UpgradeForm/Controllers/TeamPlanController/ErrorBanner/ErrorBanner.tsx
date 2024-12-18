import { UseFormSetValue } from 'react-hook-form'
import { useParams } from 'react-router-dom'

import {
  IndividualPlan,
  useAvailablePlans,
  usePlanData,
} from 'services/account'
import {
  canApplySentryUpgrade,
  findProPlans,
  findSentryPlans,
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
  const { data: plans } = useAvailablePlans({ provider, owner })
  const { data: planData } = usePlanData({ provider, owner })
  const { proPlanYear } = findProPlans({ plans })
  const { sentryPlanYear } = findSentryPlans({ plans })
  const isSentryUpgrade = canApplySentryUpgrade({
    isEnterprisePlan: planData?.plan?.isEnterprisePlan,
    plans,
  })
  const yearlyProPlan = isSentryUpgrade ? sentryPlanYear : proPlanYear

  if (errors?.seats?.message === UPGRADE_FORM_TOO_MANY_SEATS_MESSAGE) {
    return (
      <div
        className="rounded-md bg-ds-error-quinary p-3 text-ds-error-nonary"
        data-testid="team-plan-upgrade-error-banner"
      >
        &#128161; {errors.seats.message}{' '}
        <button
          className="cursor-pointer font-semibold text-ds-blue-darker hover:underline"
          onClick={() => {
            setSelectedPlan(yearlyProPlan)
            setFormValue('newPlan', yearlyProPlan, {
              shouldValidate: true,
            })
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
