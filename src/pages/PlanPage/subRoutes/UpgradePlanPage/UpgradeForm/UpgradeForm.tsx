import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'

import {
  IndividualPlan,
  useAccountDetails,
  useAvailablePlans,
  usePlanData,
} from 'services/account'
import { Provider } from 'shared/api/helpers'
import { canApplySentryUpgrade, getNextBillingDate } from 'shared/utils/billing'
import {
  getDefaultValuesUpgradeForm,
  getSchema,
  MIN_NB_SEATS_PRO,
  MIN_SENTRY_SEATS,
} from 'shared/utils/upgradeForm'

import Controller from './Controllers/Controller'
import { useUpgradeControls } from './hooks'
import PlanTypeOptions from './PlanTypeOptions'
import UpdateBlurb from './UpdateBlurb/UpdateBlurb'
import UpdateButton from './UpdateButton'
import UpgradeFormModal from './UpgradeFormModal'

type URLParams = {
  provider: Provider
  owner: string
}

type UpgradeFormProps = {
  selectedPlan: IndividualPlan
  setSelectedPlan: (plan?: IndividualPlan) => void
}

export type UpgradeFormFields = {
  newPlan?: IndividualPlan
  seats: number
}

function UpgradeForm({ selectedPlan, setSelectedPlan }: UpgradeFormProps) {
  const { provider, owner } = useParams<URLParams>()
  const { data: accountDetails } = useAccountDetails({ provider, owner })
  const { data: plans } = useAvailablePlans({ provider, owner })
  const { data: planData } = usePlanData({ owner, provider })
  const { upgradePlan } = useUpgradeControls()
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState<UpgradeFormFields>()
  const [isUpgrading, setIsUpgrading] = useState(false)
  const isSentryUpgrade = canApplySentryUpgrade({
    isEnterprisePlan: planData?.plan?.isEnterprisePlan,
    plans,
  })
  const minSeats =
    isSentryUpgrade && !selectedPlan?.isTeamPlan
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
  } = useForm<UpgradeFormFields>({
    defaultValues: getDefaultValuesUpgradeForm({
      accountDetails,
      plans,
      trialStatus,
      selectedPlan,
      plan: planData?.plan,
    }),
    resolver: zodResolver(
      getSchema({
        accountDetails,
        minSeats,
        trialStatus,
        selectedPlan,
        plan: planData?.plan,
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

  const onSubmit = handleSubmit((data) => {
    if (accountDetails?.unverifiedPaymentMethods?.length) {
      setFormData(data)
      setShowModal(true)
    } else {
      setIsUpgrading(true)
      upgradePlan(data)
    }
  })

  return (
    <form
      className="flex flex-col gap-6 border p-4 text-ds-gray-default md:w-2/3"
      onSubmit={onSubmit}
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
        setSelectedPlan={setSelectedPlan}
        newPlan={newPlan}
        seats={seats}
        setFormValue={setFormValue}
        register={register}
        errors={errors}
      />
      <UpdateBlurb
        currentPlan={planData?.plan}
        newPlan={newPlan}
        seats={Number(seats)}
        nextBillingDate={getNextBillingDate(accountDetails)!}
      />
      <UpdateButton isValid={isValid} newPlan={newPlan} seats={seats} />
      {showModal && formData && (
        <UpgradeFormModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onConfirm={() => {
            setIsUpgrading(true)
            upgradePlan(formData)
          }}
          url={
            accountDetails?.unverifiedPaymentMethods?.[0]
              ?.hostedVerificationLink || ''
          }
          isUpgrading={isUpgrading}
        />
      )}
    </form>
  )
}

export default UpgradeForm
