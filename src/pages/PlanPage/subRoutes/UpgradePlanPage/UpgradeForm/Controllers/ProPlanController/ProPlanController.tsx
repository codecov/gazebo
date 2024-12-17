import { UseFormRegister, UseFormSetValue } from 'react-hook-form'
import { z } from 'zod'

import { IndividualPlanSchema } from 'services/account'
import { MIN_NB_SEATS_PRO } from 'shared/utils/upgradeForm'
import TextInput from 'ui/TextInput'

import BillingOptions from './BillingOptions'
import PriceCallout from './PriceCallout'
import UserCount from './UserCount'

import { UpgradeFormFields } from '../../UpgradeForm'

interface ProPlanControllerProps {
  seats: number
  newPlan?: z.infer<typeof IndividualPlanSchema>

  register: UseFormRegister<UpgradeFormFields>
  setFormValue: UseFormSetValue<UpgradeFormFields>
  errors?: {
    seats?: {
      message?: string
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

export default ProPlanController
