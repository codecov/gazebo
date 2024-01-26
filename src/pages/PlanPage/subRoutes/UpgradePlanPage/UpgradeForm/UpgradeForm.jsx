import { zodResolver } from '@hookform/resolvers/zod'
import PropType from 'prop-types'
import { useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'

import {
  useAccountDetails,
  useAvailablePlans,
  usePlanData,
} from 'services/account'
import { useFlags } from 'shared/featureFlags'
import { canApplySentryUpgrade, isTeamPlan } from 'shared/utils/billing'
import {
  getDefaultValuesUpgradeForm,
  getSchema,
  MIN_NB_SEATS_PRO,
  MIN_SENTRY_SEATS,
} from 'shared/utils/upgradeForm'

import Controller from './Controllers/Controller'
import { useUpgradeControls } from './hooks'
import PlanTypeOptions from './PlanTypeOptions'
import UpdateButton from './UpdateButton'

function UpgradeForm({ selectedPlan, setSelectedPlan }) {
  const { provider, owner } = useParams()
  const { data: accountDetails } = useAccountDetails({ provider, owner })
  const { data: plans } = useAvailablePlans({ provider, owner })
  const { data: planData } = usePlanData({ owner, provider })
  const { upgradePlan } = useUpgradeControls()
  const { multipleTiers } = useFlags({
    multipleTiers: false,
  })
  const isSentryUpgrade = canApplySentryUpgrade({
    plan: accountDetails?.plan?.value,
    plans,
  })
  const minSeats =
    isSentryUpgrade && !isTeamPlan(selectedPlan?.value)
      ? MIN_SENTRY_SEATS
      : MIN_NB_SEATS_PRO

  const trialStatus = planData?.plan?.trialStatus
  const {
    register,
    handleSubmit,
    watch,
    formState: { isValid, errors },
    setValue: setFormValue,
    getValues: getFormValues,
  } = useForm({
    defaultValues: getDefaultValuesUpgradeForm({
      accountDetails,
      plans,
      trialStatus,
    }),
    resolver: zodResolver(
      getSchema({
        accountDetails,
        minSeats,
        trialStatus,
        selectedPlan,
      })
    ),
    mode: 'onChange',
  })

  const newPlan = watch('newPlan')
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
      <PlanTypeOptions
        setFormValue={setFormValue}
        getFormValues={getFormValues}
        multipleTiers={multipleTiers}
        setSelectedPlan={setSelectedPlan}
        newPlan={newPlan}
      />
      <Controller
        selectedPlan={selectedPlan?.value}
        newPlan={newPlan}
        seats={seats}
        setFormValue={setFormValue}
        register={register}
        errors={errors}
      />
      <UpdateButton isValid={isValid} newPlan={newPlan} seats={seats} />
    </form>
  )
}

export default UpgradeForm

UpgradeForm.propTypes = {
  selectedPlan: PropType.shape({
    value: PropType.string.isRequired,
  }).isRequired,
  setSelectedPlan: PropType.func.isRequired,
}
