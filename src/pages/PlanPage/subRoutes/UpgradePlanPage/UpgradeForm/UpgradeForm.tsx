import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'

import {
  IndividualPlan,
  useAccountDetails,
  useAvailablePlans,
  usePlanData,
} from 'services/account'
import {
  canApplySentryUpgrade,
  getNextBillingDate,
  isTeamPlan,
} from 'shared/utils/billing'
import {
  getDefaultValuesUpgradeForm,
  getSchema,
  MIN_NB_SEATS_PRO,
  MIN_SENTRY_SEATS,
} from 'shared/utils/upgradeForm'

import { NewPlanType } from './constants'
import Controller from './Controllers/Controller'
import { useUpgradeControls } from './hooks'
import PlanTypeOptions from './PlanTypeOptions'
import UpdateBlurb from './UpdateBlurb/UpdateBlurb'
import UpdateButton from './UpdateButton'

type URLParams = {
  provider: string
  owner: string
}

type UpgradeFormProps = {
  selectedPlan: NonNullable<IndividualPlan>
  setSelectedPlan: (plan: IndividualPlan) => void
}

export type UpgradeFormFields = {
  newPlan: NewPlanType
  seats: number
}

function UpgradeForm({ selectedPlan, setSelectedPlan }: UpgradeFormProps) {
  const { provider, owner } = useParams<URLParams>()
  const { data: accountDetails } = useAccountDetails({ provider, owner })
  const currentPlan = accountDetails?.plan
  const { data: plans } = useAvailablePlans({ provider, owner })
  const { data: planData } = usePlanData({ owner, provider })
  const { upgradePlan } = useUpgradeControls()
  const isSentryUpgrade = canApplySentryUpgrade({
    plan: currentPlan?.value,
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
    trigger,
  } = useForm({
    defaultValues: getDefaultValuesUpgradeForm({
      accountDetails,
      plans,
      trialStatus,
      selectedPlan,
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

  useEffect(() => {
    // This is necessary because the validity of seats depends on the value of newPlan
    trigger('seats')
  }, [newPlan, trigger])

  return (
    <form
      className="flex flex-col gap-6 border p-4 text-ds-gray-default md:w-2/3"
      onSubmit={handleSubmit(upgradePlan)}
    >
      <div className="flex flex-col gap-1">
        <h3 className="font-semibold">Organization</h3>
        <span>{owner}</span>
      </div>
      <PlanTypeOptions
        setFormValue={setFormValue}
        setSelectedPlan={setSelectedPlan}
        newPlan={newPlan}
      />
      <Controller
        selectedPlan={selectedPlan.value as NewPlanType}
        setSelectedPlan={setSelectedPlan}
        newPlan={newPlan}
        seats={seats}
        setFormValue={setFormValue}
        register={register}
        errors={errors}
      />
      <UpdateBlurb
        currentPlan={currentPlan}
        selectedPlan={selectedPlan}
        newPlanName={newPlan}
        seats={Number(seats)}
        nextBillingDate={getNextBillingDate(accountDetails)!}
      />
      <UpdateButton isValid={isValid} newPlan={newPlan} seats={seats} />
    </form>
  )
}

export default UpgradeForm
