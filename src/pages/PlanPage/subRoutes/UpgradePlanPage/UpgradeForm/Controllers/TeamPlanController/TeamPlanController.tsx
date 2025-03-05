import { UseFormRegister, UseFormSetValue } from 'react-hook-form'

import { IndividualPlan } from 'services/account/useAvailablePlans'
import {
  MIN_NB_SEATS_PRO,
  TEAM_PLAN_MAX_ACTIVE_USERS,
} from 'shared/utils/upgradeForm'
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
      {errors?.seats?.message ? (
        <ErrorBanner
          errors={errors}
          setFormValue={setFormValue}
          setSelectedPlan={setSelectedPlan}
        />
      ) : null}
    </>
  )
}

export default PlanController
