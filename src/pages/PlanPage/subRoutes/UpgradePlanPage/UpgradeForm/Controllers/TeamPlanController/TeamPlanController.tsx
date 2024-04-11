import { UseFormRegister, UseFormSetValue } from 'react-hook-form'
import { useParams } from 'react-router-dom'

import {
  IndividualPlan,
  useAccountDetails,
  useAvailablePlans,
} from 'services/account'
import {
  canApplySentryUpgrade,
  findProPlans,
  findSentryPlans,
} from 'shared/utils/billing'
import {
  MIN_NB_SEATS_PRO,
  TEAM_PLAN_MAX_ACTIVE_USERS,
  UPGRADE_FORM_TOO_MANY_SEATS_MESSAGE,
} from 'shared/utils/upgradeForm'
import TextInput from 'ui/TextInput'

import BillingOptions from './BillingOptions'
import PriceCallout from './PriceCallout'
import UserCount from './UserCount'

import { NewPlanType } from '../../constants'
import { UpgradeFormFields } from '../../UpgradeForm'

interface Errors {
  seats?: {
    message?: string
  }
}

interface ErrorBannerProps {
  errors?: Errors
  setFormValue: UseFormSetValue<UpgradeFormFields>
  setSelectedPlan: (plan: IndividualPlan) => void
}

function ErrorBanner({
  errors,
  setFormValue,
  setSelectedPlan,
}: ErrorBannerProps) {
  const { provider, owner } = useParams<{ provider: string; owner: string }>()
  const { data: plans } = useAvailablePlans({ provider, owner })
  const { data: accountDetails } = useAccountDetails({ provider, owner })
  const { proPlanYear } = findProPlans({ plans })
  const { sentryPlanYear } = findSentryPlans({ plans })
  const plan = accountDetails?.rootOrganization?.plan ?? accountDetails?.plan
  const isSentryUpgrade = canApplySentryUpgrade({ plan, plans })
  const yearlyProPlan = isSentryUpgrade ? sentryPlanYear : proPlanYear
  console.log(yearlyProPlan)

  if (!errors?.seats?.message) {
    return null
  }

  if (errors.seats.message === UPGRADE_FORM_TOO_MANY_SEATS_MESSAGE) {
    return (
      <div className="rounded-md bg-ds-error-quinary p-3 text-ds-error-nonary">
        &#128161; {errors.seats.message}{' '}
        <button
          className="cursor-pointer font-semibold text-ds-blue-darker hover:underline"
          onClick={() => {
            setSelectedPlan(yearlyProPlan)
            setFormValue('newPlan', yearlyProPlan.value, {
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
    <p className="rounded-md bg-ds-error-quinary p-3 text-ds-error-nonary">
      {errors.seats.message}
    </p>
  )
}

interface PlanControllerProps {
  seats: number
  newPlan: NewPlanType
  register: UseFormRegister<UpgradeFormFields>
  setFormValue: UseFormSetValue<UpgradeFormFields>
  setSelectedPlan: (plan: IndividualPlan) => void
  errors?: Errors
}

const PlanController: React.FC<PlanControllerProps> = ({
  newPlan,
  seats,
  setFormValue,
  setSelectedPlan,
  register,
  errors,
}) => {
  return (
    <>
      <div className="flex flex-col gap-2">
        <BillingOptions newPlan={newPlan} setFormValue={setFormValue} />
      </div>
      <div className="flex flex-col gap-2 xl:w-5/12">
        <div className="w-1/2">
          <TextInput
            data-cy="seats"
            dataMarketing="plan-pricing-seats"
            {...register('seats')}
            id="nb-seats"
            size={20}
            type="number"
            label="Enter seat count"
            min={MIN_NB_SEATS_PRO}
            max={TEAM_PLAN_MAX_ACTIVE_USERS}
          />
        </div>
        <UserCount />
      </div>
      <PriceCallout
        seats={seats}
        newPlan={newPlan}
        setFormValue={setFormValue}
      />
      <ErrorBanner
        errors={errors}
        setFormValue={setFormValue}
        setSelectedPlan={setSelectedPlan}
      />
    </>
  )
}

export default PlanController
