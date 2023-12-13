import { FieldValues, UseFormRegister } from 'react-hook-form'

import { isSentryPlan, isTeamPlan } from 'shared/utils/billing'

import ProPlanController from './ProPlanController'
import SentryPlanController from './SentryPlanController'
import TeamPlanController from './TeamPlanController'

import { NewPlanType } from '../PlanTypeOptions/PlanTypeOptions'

interface BillingControlsProps {
  seats: number
  newPlan: NewPlanType
  selectedPlan: NewPlanType
  register: UseFormRegister<FieldValues>
  setFormValue: (x: string, y: string) => void
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
  selectedPlan,
  setFormValue,
}) => {
  if (isTeamPlan(selectedPlan)) {
    return (
      <TeamPlanController
        newPlan={newPlan}
        seats={seats}
        setFormValue={setFormValue}
        register={register}
        errors={errors}
      />
    )
  } else if (isSentryPlan(selectedPlan)) {
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
