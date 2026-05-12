import { UseFormRegister, UseFormSetValue } from 'react-hook-form'

import { IndividualPlan } from 'services/account/useAvailablePlans'

import ProPlanController from './ProPlanController'
import SentryPlanController from './SentryPlanController'
import TeamPlanController from './TeamPlanController'

import { UpgradeFormFields } from '../UpgradeForm'

interface BillingControlsProps {
  seats: number
  newPlan?: IndividualPlan
  register: UseFormRegister<UpgradeFormFields>
  setFormValue: UseFormSetValue<UpgradeFormFields>
  setSelectedPlan: (plan?: IndividualPlan) => void
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
  if (newPlan?.isTeamPlan) {
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
  } else if (newPlan?.isSentryPlan) {
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
