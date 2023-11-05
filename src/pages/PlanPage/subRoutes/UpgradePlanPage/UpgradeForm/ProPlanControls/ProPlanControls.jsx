import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'

import {
  useAccountDetails,
  useAvailablePlans,
  usePlanData,
} from 'services/account'
import { useProPlans } from 'shared/utils/billing'
import {
  getDefaultValuesProUpgrade,
  getSchema,
  MIN_NB_SEATS_PRO,
} from 'shared/utils/upgradeForm'
import TextInput from 'ui/TextInput'

import BillingControls from './BillingControls'
import TotalBanner from './TotalBanner'
import UserCount from './UserCount'

import { useUpgradeControls } from '../hooks'
import UpdateButton from '../UpdateButton'

function ProPlanControls() {
  const { provider, owner } = useParams()
  const { data: accountDetails } = useAccountDetails({ provider, owner })
  const { data: plans } = useAvailablePlans({ provider, owner })
  const { data: planData } = usePlanData({ owner, provider })
  const { proPlanYear } = useProPlans({ plans })
  const { upgradePlan } = useUpgradeControls()

  const trialStatus = planData?.plan?.trialStatus
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
      })
    ),
    mode: 'onChange',
  })

  const newPlan = getValues('newPlan')
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
      <TotalBanner seats={seats} newPlan={newPlan} setValue={setValue} />
      {/* The next invoice logic has not been working for a long time so I just deleted it. There should be a screenshot I
      attached showing how it should look, mega showing how much we haven't properly used this. Deleting for now */}
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
