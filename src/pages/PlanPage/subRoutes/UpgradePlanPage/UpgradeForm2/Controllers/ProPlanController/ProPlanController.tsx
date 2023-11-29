import { FieldValues, UseFormRegister } from 'react-hook-form'
import { useParams } from 'react-router-dom'

import { useAccountDetails } from 'services/account'
import { getNextBillingDate } from 'shared/utils/billing'
import { MIN_NB_SEATS_PRO } from 'shared/utils/upgradeForm'
import TextInput from 'ui/TextInput'

import BillingOptions from './BillingOptions'
import PriceCallout from './PriceCallout'
import UserCount from './UserCount'

import { NewPlanType } from '../../PlanTypeOptions/PlanTypeOptions'

export type SelectedPlanType = 'users-pr-inappy' | 'users-sentryy'

interface ProPlanControllerProps {
  newPlan: NewPlanType
  selectedPlan: SelectedPlanType
  seats: number
  setFormValue: (x: string, y: string) => void
  register: UseFormRegister<FieldValues>
  errors: {
    seats: {
      message: string
    }
  }
}

const ProPlanController: React.FC<ProPlanControllerProps> = ({
  newPlan,
  seats,
  setFormValue,
  register,
  errors,
}) => {
  const { provider, owner } = useParams<{ owner: string; provider: string }>()
  const { data: accountDetails } = useAccountDetails({ provider, owner })
  const nextBillingDate = getNextBillingDate(accountDetails)

  return (
    <>
      <div className="flex flex-col gap-2">
        <BillingOptions newPlan={newPlan} setFormValue={setFormValue} />
      </div>
      <div className="flex flex-col gap-2 xl:w-5/12">
        <div className="w-2/6">
          <TextInput
            data-cy="seats"
            dataMarketing="plan-pricing-seats"
            {...register('seats')}
            id="nb-seats"
            size={20}
            type="number"
            label="Seat count"
            min={MIN_NB_SEATS_PRO}
          />
        </div>
        <UserCount />
      </div>
      <PriceCallout
        seats={seats}
        newPlan={newPlan}
        setFormValue={setFormValue}
      />
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
    </>
  )
}

export default ProPlanController
