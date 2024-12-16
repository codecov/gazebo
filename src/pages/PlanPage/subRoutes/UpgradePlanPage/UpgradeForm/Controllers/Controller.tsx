import { UseFormRegister, UseFormSetValue } from 'react-hook-form'

import { isSentryPlan, isTeamPlan, Plan } from 'shared/utils/billing'

import ProPlanController from './ProPlanController'
import SentryPlanController from './SentryPlanController'
import TeamPlanController from './TeamPlanController'

import { UpgradeFormFields } from '../UpgradeForm'

interface BillingControlsProps {
  seats: number
  newPlan?: Plan
  register: UseFormRegister<UpgradeFormFields>
  setFormValue: UseFormSetValue<UpgradeFormFields>
  setSelectedPlan: (plan?: Plan) => void
  errors?: {
    seats?: {
      message?: string
    }
  }
}

const Controller: React.FC<BillingControlsProps> = ({
  seats,
  errors,
  newPlan,
  register,
  setFormValue,
  setSelectedPlan,
}) => {
  if (isTeamPlan(newPlan?.value)) {
    return (
      <TeamPlanController
        newPlan={newPlan}
        seats={seats}
        setFormValue={setFormValue}
        setSelectedPlan={setSelectedPlan}
        register={register}
        errors={errors}
      />
    )
  } else if (isSentryPlan(newPlan?.value)) {
    return (
      <SentryPlanController
        newPlan={newPlan}
        seats={seats}
        setFormValue={setFormValue}
        register={register}
        errors={errors}
      />
    )
  }
  return (
    <ProPlanController
      newPlan={newPlan}
      seats={seats}
      setFormValue={setFormValue}
      register={register}
      errors={errors}
    />
  )
}

export default Controller
