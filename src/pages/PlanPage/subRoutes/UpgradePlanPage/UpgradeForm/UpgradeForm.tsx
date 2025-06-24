import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'

import { useAccountDetails } from 'services/account/useAccountDetails'
import {
  IndividualPlan,
  useAvailablePlans,
} from 'services/account/useAvailablePlans'
import { usePlanData } from 'services/account/usePlanData'
import { useUnverifiedPaymentMethods } from 'services/account/useUnverifiedPaymentMethods'
import { useOwner } from 'services/user'
import { Provider } from 'shared/api/helpers'
import { canApplySentryUpgrade } from 'shared/utils/billing'
import {
  getDefaultValuesUpgradeForm,
  getSchema,
  MIN_NB_SEATS_PRO,
  MIN_SENTRY_SEATS,
} from 'shared/utils/upgradeForm'
import Avatar from 'ui/Avatar'
import { Card } from 'ui/Card'

import Controller from './Controllers/Controller'
import { useUpgradeControls } from './hooks'
import PendingUpgradeModal from './PendingUpgradeModal'
import { PersonalOrgWarning } from './PersonalOrgWarning'
import PlanTypeOptions from './PlanTypeOptions'
import UpdateButton from './UpdateButton'

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
  const { data: ownerData } = useOwner({ username: owner })
  const { data: accountDetails } = useAccountDetails({ provider, owner })
  const { data: plans } = useAvailablePlans({ provider, owner })
  const { data: planData } = usePlanData({ owner, provider })
  const { data: unverifiedPaymentMethods } = useUnverifiedPaymentMethods({
    provider,
    owner,
  })
  const { upgradePlan } = useUpgradeControls()
  const [showPendingUpgradeModal, setShowPendingUpgradeModal] = useState(false)
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

  const awaitingInitialPaymentMethodVerification =
    !!unverifiedPaymentMethods?.length &&
    !accountDetails?.subscriptionDetail?.defaultPaymentMethod

  useEffect(() => {
    // This is necessary because the validity of seats depends on the value of newPlan
    trigger('seats')
  }, [newPlan, trigger])

  const onSubmit = handleSubmit((data) => {
    if (awaitingInitialPaymentMethodVerification) {
      setFormData(data)
      setShowPendingUpgradeModal(true)
    } else {
      setIsUpgrading(true)
      upgradePlan(data)
    }
  })

  return (
    <Card className="flex-1 bg-transparent">
      <Card.Header>
        <div className="flex flex-col gap-1">
          <h3 className="font-semibold">Organization</h3>
          <div className="flex items-center gap-2">
            <Avatar user={ownerData} border="dark" />
            <h4>{owner}</h4>
          </div>
        </div>
      </Card.Header>
      <form className="text-ds-gray-default">
        <Card.Content>
          <PlanTypeOptions
            setFormValue={setFormValue}
            setSelectedPlan={setSelectedPlan}
            newPlan={newPlan}
          />
        </Card.Content>
        <hr />
        <Controller
          setSelectedPlan={setSelectedPlan}
          newPlan={newPlan}
          seats={seats}
          setFormValue={setFormValue}
          register={register}
          errors={errors}
        />
        <Card.Content className="flex flex-col gap-6 pb-6">
          <PersonalOrgWarning />
          <UpdateButton
            isValid={isValid}
            newPlan={newPlan}
            seats={seats}
            onSubmit={onSubmit}
            isLoading={isUpgrading}
          />
          {showPendingUpgradeModal && formData ? (
            <PendingUpgradeModal
              isOpen={showPendingUpgradeModal}
              onClose={() => setShowPendingUpgradeModal(false)}
              onConfirm={() => {
                setIsUpgrading(true)
                upgradePlan(formData)
              }}
              url={unverifiedPaymentMethods?.[0]?.hostedVerificationUrl || ''}
              isUpgrading={isUpgrading}
            />
          ) : null}
        </Card.Content>
      </form>
    </Card>
  )
}

export default UpgradeForm
