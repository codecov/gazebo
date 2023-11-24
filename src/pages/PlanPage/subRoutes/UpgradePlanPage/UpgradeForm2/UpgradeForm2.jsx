import { zodResolver } from '@hookform/resolvers/zod'
import PropType from 'prop-types'
import { useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'

import {
  useAccountDetails,
  useAvailablePlans,
  usePlanData,
} from 'services/account'
import { useFlags } from 'shared/featureFlags'
import {
  canApplySentryUpgrade,
  getNextBillingDate,
  isTeamPlan,
  shouldDisplayTeamCard,
} from 'shared/utils/billing'
import {
  getDefaultValuesUpgradeForm,
  getSchema,
  MIN_NB_SEATS_PRO,
  MIN_SENTRY_SEATS,
} from 'shared/utils/upgradeForm'
import TextInput from 'ui/TextInput'

import BillingOptions from './Controllers/ProPlanController/BillingOptions'
import PriceCallout from './Controllers/ProPlanController/PriceCallout'
import UserCount from './Controllers/ProPlanController/UserCount'
import { useUpgradeControls } from './hooks'
import PlanDetailsOptions from './PlanDetailsOptions'
import UpdateButton from './UpdateButton'

function UpgradeForm2({ selectedPlan, setSelectedPlan }) {
  const { provider, owner } = useParams()
  const { data: accountDetails } = useAccountDetails({ provider, owner })
  const { data: plans } = useAvailablePlans({ provider, owner })
  const { data: planData } = usePlanData({ owner, provider })
  const { upgradePlan } = useUpgradeControls()
  const { multipleTiers } = useFlags({
    multipleTiers: false,
  })
  const isSentryUpgrade = canApplySentryUpgrade({
    plan: accountDetails?.plan?.value,
    plans,
  })
  const minSeats =
    isSentryUpgrade && !isTeamPlan(selectedPlan?.value)
      ? MIN_SENTRY_SEATS
      : MIN_NB_SEATS_PRO

  const trialStatus = planData?.plan?.trialStatus
  const nextBillingDate = getNextBillingDate(accountDetails)
  const {
    register,
    handleSubmit,
    watch,
    formState: { isValid, errors },
    setValue,
    getValues,
  } = useForm({
    defaultValues: getDefaultValuesUpgradeForm({
      accountDetails,
      plans,
      trialStatus,
    }),
    resolver: zodResolver(
      getSchema({
        accountDetails,
        minSeats,
        trialStatus,
        selectedPlan,
      })
    ),
    mode: 'onChange',
  })
  const hasTeamPlans = shouldDisplayTeamCard({ plans })

  const newPlan = watch('newPlan')
  const seats = watch('seats')

  return (
    <form
      className="flex flex-col gap-4 border p-4 text-ds-gray-nonary md:w-2/3"
      onSubmit={handleSubmit(upgradePlan)}
    >
      <div className="flex flex-col gap-1">
        <h3 className="font-semibold">Organization</h3>
        <span>{owner}</span>
      </div>
      {hasTeamPlans && multipleTiers && (
        <PlanDetailsOptions
          setValue={setValue}
          setSelectedPlan={setSelectedPlan}
        />
      )}
      <div className="flex flex-col gap-2">
        <BillingOptions planString={newPlan} setValue={setValue} />
      </div>
      <div className="flex flex-col gap-2 xl:w-5/12">
        <div className="w-2/6">
          <TextInput
            data-cy="seats"
            dataMarketing="plan-pricing-seats"
            {...register('seats')}
            id="nb-seats"
            size="20"
            type="number"
            label="Seat count"
            min={MIN_NB_SEATS_PRO}
          />
        </div>
        <UserCount />
      </div>
      <PriceCallout seats={seats} newPlan={newPlan} setValue={setValue} />
      {nextBillingDate && (
        <p className="mt-1 flex">
          Next Billing Date
          <span className="ml-auto">{nextBillingDate}</span>
        </p>
      )}
      {errors?.seats && (
        <p className="rounded-md bg-ds-error-quinary p-3 text-ds-error-nonary">
          {errors?.seats?.message}
        </p>
      )}
      <div className="w-fit">
        <UpdateButton
          isValid={isValid}
          getValues={getValues}
          value={accountDetails?.plan?.value}
          quantity={accountDetails?.plan?.quantity}
        />
      </div>
    </form>
  )
}

export default UpgradeForm2

UpgradeForm2.propTypes = {
  selectedPlan: PropType.string.isRequired,
  setSelectedPlan: PropType.func.isRequired,
}
