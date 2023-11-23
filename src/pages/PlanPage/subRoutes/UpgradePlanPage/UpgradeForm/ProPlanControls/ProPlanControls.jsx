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
  getNextBillingDate,
  shouldDisplayTeamCard,
  useProPlans,
} from 'shared/utils/billing'
import {
  getDefaultValuesProUpgrade,
  getSchema,
  MIN_NB_SEATS_PRO,
} from 'shared/utils/upgradeForm'
import TextInput from 'ui/TextInput'

import BillingControls from './BillingControls'
import PlanDetailsControls from './PlanDetailsControls'
import TotalPriceCallout from './TotalPriceCallout'
import UserCount from './UserCount'

import { useUpgradeControls } from '../hooks'
import UpdateButton from '../UpdateButton'

// eslint-disable-next-line react/prop-types
function ProPlanControls({ selectedPlan, setSelectedPlan }) {
  const { provider, owner } = useParams()
  const { data: accountDetails } = useAccountDetails({ provider, owner })
  const { data: plans } = useAvailablePlans({ provider, owner })
  const { data: planData } = usePlanData({ owner, provider })
  const { proPlanYear } = useProPlans({ plans })
  const { upgradePlan } = useUpgradeControls()
  const { multipleTiers } = useFlags({
    multipleTiers: false,
  })

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
    defaultValues: getDefaultValuesProUpgrade({
      accountDetails,
      proPlanYear,
      trialStatus,
    }),
    resolver: zodResolver(
      getSchema({
        accountDetails,
        minSeats: MIN_NB_SEATS_PRO,
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
        <PlanDetailsControls
          setValue={setValue}
          setSelectedPlan={setSelectedPlan}
        />
      )}
      <div className="flex flex-col gap-2">
        <BillingControls planString={newPlan} setValue={setValue} />
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
      <TotalPriceCallout seats={seats} newPlan={newPlan} setValue={setValue} />
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

export default ProPlanControls

ProPlanControls.propTypes = {
  selectedPlan: PropType.string.isRequired,
  setSelectedPlan: PropType.func.isRequired,
}
