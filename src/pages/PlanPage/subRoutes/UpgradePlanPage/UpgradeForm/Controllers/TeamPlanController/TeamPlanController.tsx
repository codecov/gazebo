import { FieldValues, UseFormRegister } from 'react-hook-form'

import { MIN_NB_SEATS_PRO } from 'shared/utils/upgradeForm'
import TextInput from 'ui/TextInput'

import BillingOptions from './BillingOptions'
import PriceCallout from './PriceCallout'
import UserCount from './UserCount'

import { NewPlanType } from '../../constants'

interface PlanControllerProps {
  seats: number
  newPlan: NewPlanType
  register: UseFormRegister<FieldValues>
  setFormValue: (x: string, y: string) => void
  errors?: {
    seats?: {
      message?: string
    }
  }
}

const PlanController: React.FC<PlanControllerProps> = ({
  newPlan,
  seats,
  setFormValue,
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
          />
        </div>
        <UserCount />
      </div>
      <PriceCallout
        seats={seats}
        newPlan={newPlan}
        setFormValue={setFormValue}
      />
      {errors?.seats && (
        <p className="rounded-md bg-ds-error-quinary p-3 text-ds-error-nonary">
          {errors?.seats?.message}
        </p>
      )}
    </>
  )
}

export default PlanController
