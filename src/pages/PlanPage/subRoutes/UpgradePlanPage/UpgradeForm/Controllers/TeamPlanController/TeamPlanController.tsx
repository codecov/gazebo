import { UseFormRegister, UseFormSetValue } from 'react-hook-form'

import { IndividualPlan } from 'services/account/useAvailablePlans'
import {
  MIN_NB_SEATS_PRO,
  TEAM_PLAN_MAX_ACTIVE_USERS,
} from 'shared/utils/upgradeForm'
import { Card } from 'ui/Card'
import TextInput from 'ui/TextInput'

import BillingOptions from './BillingOptions'
import ErrorBanner from './ErrorBanner'
import PriceCallout from './PriceCallout'
import UserCount from './UserCount'

import { UpgradeFormFields } from '../../UpgradeForm'

interface Errors {
  seats?: {
    message?: string
  }
}

interface PlanControllerProps {
  seats: number
  newPlan?: IndividualPlan
  register: UseFormRegister<UpgradeFormFields>
  setFormValue: UseFormSetValue<UpgradeFormFields>
  setSelectedPlan: (plan?: IndividualPlan) => void
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
      <Card.Content>
        <div className="flex flex-col gap-2">
          <BillingOptions newPlan={newPlan} setFormValue={setFormValue} />
        </div>
      </Card.Content>
      <hr />
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
              max={TEAM_PLAN_MAX_ACTIVE_USERS}
            />
          </div>
          <UserCount />
        </div>
      </Card.Content>
      <Card.Content>
        <PriceCallout
          seats={seats}
          newPlan={newPlan}
          setFormValue={setFormValue}
        />
        {errors?.seats?.message ? (
          <ErrorBanner
            errors={errors}
            setFormValue={setFormValue}
            setSelectedPlan={setSelectedPlan}
          />
        ) : null}
      </Card.Content>
    </>
  )
}

export default PlanController
