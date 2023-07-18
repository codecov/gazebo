import { zodResolver } from '@hookform/resolvers/zod'
import PropTypes from 'prop-types'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useHistory, useParams } from 'react-router-dom'

import {
  accountDetailsPropType,
  planPropType,
  usePlans,
  useUpgradePlan,
} from 'services/account'
import { useAddNotification } from 'services/toastNotification'
import { TrialStatuses, useTrialData } from 'services/trial'
import {
  canApplySentryUpgrade,
  getNextBillingDate,
  isAnnualPlan,
} from 'shared/utils/billing'
import {
  calculatePrice,
  getInitialDataForm,
  getSchema,
  MIN_NB_SEATS,
  MIN_SENTRY_SEATS,
  SENTRY_PRICE,
} from 'shared/utils/upgradeForm'
import A from 'ui/A'
import Icon from 'ui/Icon'
import TextInput from 'ui/TextInput'

import BillingControls from './BillingControls'
import TotalBanner from './TotalBanner'
import UpdateButton from './UpdateButton'
import UserCount from './UserCount'

const useUpgradeForm = ({
  proPlanYear,
  proPlanMonth,
  accountDetails,
  minSeats,
  sentryPrice,
  sentryPlanYear,
  sentryPlanMonth,
  isSentryUpgrade,
  organizationName,
}) => {
  const { provider } = useParams()
  const history = useHistory()
  const addToast = useAddNotification()

  const { mutate, ...rest } = useUpgradePlan({
    provider,
    owner: organizationName,
  })

  const upgradePlan = ({ seats, newPlan }) =>
    mutate(
      {
        seats,
        newPlan,
      },
      {
        onSuccess: () => {
          addToast({
            type: 'success',
            text: 'Plan successfully upgraded',
          })
          history.push(`/plan/${provider}/${organizationName}`)
        },
        onError: (error) => {
          addToast({
            type: 'error',
            text: error?.data?.detail || 'Something went wrong',
          })
        },
      }
    )

  const { register, handleSubmit, watch, formState, setValue, getValues } =
    useForm({
      defaultValues: getInitialDataForm({
        accountDetails,
        proPlanYear,
        isSentryUpgrade,
        sentryPlanYear,
      }),
      resolver: zodResolver(getSchema({ accountDetails, minSeats })),
      mode: 'onChange',
    })

  const perYearPrice = calculatePrice({
    seats: watch('seats'),
    baseUnitPrice: isSentryUpgrade
      ? sentryPlanYear?.baseUnitPrice
      : proPlanYear?.baseUnitPrice,
    isSentryUpgrade,
    sentryPrice,
  })

  const perMonthPrice = calculatePrice({
    seats: watch('seats'),
    baseUnitPrice: isSentryUpgrade
      ? sentryPlanMonth?.baseUnitPrice
      : proPlanMonth?.baseUnitPrice,
    isSentryUpgrade,
    sentryPrice,
  })

  const isPerYear = isAnnualPlan(watch('newPlan'))

  return {
    perYearPrice,
    perMonthPrice,
    register,
    handleSubmit,
    isPerYear,
    formState,
    setValue,
    getValues,
    upgradePlan,
    watch,
    ...rest,
  }
}

const PlanDetails = ({ isSentryUpgrade, trialStatus }) => {
  if (!isSentryUpgrade) {
    return null
  }

  return (
    <div>
      <h3 className="font-semibold">Plan</h3>
      <p>
        {trialStatus !== TrialStatuses.EXPIRED && (
          <span>14 day free trial, then </span>
        )}
        $29 monthly includes 5 seats.
      </p>
    </div>
  )
}

PlanDetails.propTypes = {
  isSentryUpgrade: PropTypes.bool,
  trialStatus: PropTypes.string,
}

// eslint-disable-next-line max-statements, complexity
function UpgradeForm({
  accountDetails,
  proPlanYear,
  proPlanMonth,
  organizationName,
  sentryPlanYear,
  sentryPlanMonth,
}) {
  const { provider } = useParams()
  const { data: plans } = usePlans(provider)
  const nextBillingDate = getNextBillingDate(accountDetails)

  const { data: trialData } = useTrialData({
    provider,
    owner: organizationName,
    opts: {
      enabled: !!organizationName,
    },
  })

  const isSentryUpgrade = canApplySentryUpgrade({
    plan: accountDetails?.plan?.value,
    plans,
  })

  const minSeats = isSentryUpgrade ? MIN_SENTRY_SEATS : MIN_NB_SEATS
  const trialStatus = trialData?.plan?.trialStatus
  const hasPaymentMethod =
    accountDetails?.subscriptionDetail?.defaultPaymentMethod ?? null

  const {
    perYearPrice,
    perMonthPrice,
    register,
    handleSubmit,
    isPerYear,
    setValue,
    getValues,
    formState: { isValid, errors },
    upgradePlan,
    watch,
  } = useUpgradeForm({
    proPlanYear,
    proPlanMonth,
    accountDetails,
    minSeats,
    sentryPrice: SENTRY_PRICE,
    sentryPlanYear,
    sentryPlanMonth,
    isSentryUpgrade,
    organizationName,
  })

  let disableInputs = true
  if (!!organizationName && !!accountDetails) {
    disableInputs = false
  }

  useEffect(() => {
    if (organizationName && accountDetails) {
      const updatedData = getInitialDataForm({
        accountDetails,
        proPlanYear,
        sentryPlanYear,
        isSentryUpgrade,
        minSeats,
      })

      // for some reason reset was not longer working so
      // this is a bit of a hack to get the values to reset
      setValue('newPlan', updatedData.newPlan)
      setValue('seats', updatedData.seats)
    }
  }, [
    organizationName,
    proPlanYear,
    proPlanMonth,
    accountDetails,
    minSeats,
    sentryPlanYear,
    isSentryUpgrade,
    setValue,
  ])

  const planString = getValues('newPlan')

  return (
    <form
      className="flex flex-col gap-4 pt-4 text-ds-gray-nonary"
      onSubmit={handleSubmit(upgradePlan)}
    >
      <PlanDetails
        isSentryUpgrade={isSentryUpgrade}
        trialStatus={trialStatus}
      />
      {/* If not on trial, show the plan details without the credit card prompt */}
      {trialStatus === TrialStatuses.NOT_STARTED ? (
        <>
          <BillingControls
            disableInputs={disableInputs}
            planString={planString}
            isSentryUpgrade={isSentryUpgrade}
            setValue={setValue}
          />
          <div className="flex flex-col gap-2 xl:w-5/12">
            <div className="w-2/6">
              <TextInput
                data-cy="seats"
                dataMarketing="plan-pricing-seats"
                {...register('seats')}
                id="nb-seats"
                size="20"
                type="number"
                label="Seat count"
                disabled={disableInputs}
                min={minSeats}
              />
            </div>
            <UserCount
              activatedStudentCount={accountDetails?.activatedStudentCount}
              activatedUserCount={accountDetails?.activatedUserCount}
              inactiveUserCount={accountDetails?.inactiveUserCount}
              isSentryUpgrade={isSentryUpgrade}
            />
          </div>
          {!disableInputs && (
            <TotalBanner
              isPerYear={isPerYear}
              perYearPrice={perYearPrice}
              perMonthPrice={perMonthPrice}
              setValue={setValue}
              isSentryUpgrade={isSentryUpgrade}
              sentryPlanYear={sentryPlanYear}
              sentryPlanMonth={sentryPlanMonth}
              seats={watch('seats')}
            />
          )}
          {nextBillingDate && (
            <p className="mt-1 flex">
              Next Billing Date
              <span className="ml-auto">{nextBillingDate}</span>
            </p>
          )}
          {errors?.seats && (
            <p className="rounded-md bg-ds-error-quinary p-3 text-ds-error-nonary">
              {errors?.seats?.message}
            </p>
          )}
          <div className="w-fit">
            <UpdateButton
              isValid={isValid}
              getValues={getValues}
              value={accountDetails?.plan?.value}
              quantity={accountDetails?.plan?.quantity}
              disableInputs={disableInputs}
              isSentryUpgrade={isSentryUpgrade}
              organizationName={organizationName}
              trialStatus={trialStatus}
            />
          </div>
        </>
      ) : trialStatus === TrialStatuses.ONGOING && !hasPaymentMethod ? (
        // If on trial, if no credit card, only show the credit card prompt
        <A
          href="https://billing.stripe.com/p/login/aEU00i9by3V4caQ6oo"
          hook="stripe-account-management-portal"
        >
          Proceed with plan and input billing information
          <Icon name="chevronRight" size="sm" variant="solid" />
        </A>
      ) : (
        <>
          {/* If on trial, if credit card, only show the billing details */}
          <BillingControls
            disableInputs={disableInputs}
            planString={planString}
            isSentryUpgrade={isSentryUpgrade}
            setValue={setValue}
          />
          <div className="flex flex-col gap-2 xl:w-5/12">
            <div className="w-2/6">
              <TextInput
                data-cy="seats"
                dataMarketing="plan-pricing-seats"
                {...register('seats')}
                id="nb-seats"
                size="20"
                type="number"
                label="Seat count"
                disabled={disableInputs}
                min={minSeats}
              />
            </div>
            <UserCount
              activatedStudentCount={accountDetails?.activatedStudentCount}
              activatedUserCount={accountDetails?.activatedUserCount}
              inactiveUserCount={accountDetails?.inactiveUserCount}
              isSentryUpgrade={isSentryUpgrade}
            />
          </div>
          {!disableInputs && (
            <TotalBanner
              isPerYear={isPerYear}
              perYearPrice={perYearPrice}
              perMonthPrice={perMonthPrice}
              setValue={setValue}
              isSentryUpgrade={isSentryUpgrade}
              sentryPlanYear={sentryPlanYear}
              sentryPlanMonth={sentryPlanMonth}
              seats={watch('seats')}
            />
          )}
          {nextBillingDate && (
            <p className="mt-1 flex">
              Next Billing Date
              <span className="ml-auto">{nextBillingDate}</span>
            </p>
          )}
          {errors?.seats && (
            <p className="rounded-md bg-ds-error-quinary p-3 text-ds-error-nonary">
              {errors?.seats?.message}
            </p>
          )}
          <div className="w-fit">
            <UpdateButton
              isValid={isValid}
              getValues={getValues}
              value={accountDetails?.plan?.value}
              quantity={accountDetails?.plan?.quantity}
              disableInputs={disableInputs}
              isSentryUpgrade={isSentryUpgrade}
              organizationName={organizationName}
              trialStatus={trialStatus}
            />
          </div>
        </>
      )}
    </form>
  )
}

UpgradeForm.propTypes = {
  proPlanYear: planPropType,
  proPlanMonth: planPropType,
  accountDetails: accountDetailsPropType,
  organizationName: PropTypes.string,
  sentryPlanYear: planPropType,
  sentryPlanMonth: planPropType,
}

export default UpgradeForm
