import { UseFormRegister, UseFormSetValue } from 'react-hook-form'

import { IndividualPlan } from 'services/account/useAvailablePlans'
import { MIN_NB_SEATS_PRO } from 'shared/utils/upgradeForm'
import { Card } from 'ui/Card'
import TextInput from 'ui/TextInput'

import BillingOptions from './BillingOptions'
import PriceCallout from './PriceCallout'
import UserCount from './UserCount'

import { UpgradeFormFields } from '../../UpgradeForm'

interface ProPlanControllerProps {
  seats: number
  newPlan?: IndividualPlan

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
      <Card.Content>
        <div className="flex flex-col gap-2">
          <BillingOptions newPlan={newPlan} setFormValue={setFormValue} />
        </div>
      </Card.Content>
      <hr />
      {/* if you're reading this, I'm sorry */}
      <Card.Content>
        <div className="flex flex-col gap-2 xl:w-5/12">
          <label htmlFor="nb-seats" className="font-semibold">
            Step 3: Enter seat count
          </label>
          <div className="w-1/4">
            <TextInput
              data-cy="seats"
              dataMarketing="plan-pricing-seats"
              {...register('seats')}
              id="nb-seats"
              size={20}
              type="number"
              min={MIN_NB_SEATS_PRO}
            />
          </div>
          <UserCount />
        </div>
      </Card.Content>
      <Card.Content>
        <PriceCallout seats={seats} newPlan={newPlan} />
        {errors?.seats && (
          <p className="rounded-md bg-ds-error-quinary p-3 text-ds-error-nonary">
            {errors?.seats?.message}
          </p>
        )}
      </Card.Content>
    </>
  )
}

export default ProPlanController
