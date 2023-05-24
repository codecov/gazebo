import { zodResolver } from '@hookform/resolvers/zod'
import PropTypes from 'prop-types'
import { useForm } from 'react-hook-form'
import { useHistory, useParams } from 'react-router-dom'

import {
  accountDetailsPropType,
  planPropType,
  usePlans,
  useUpgradePlan,
} from 'services/account'
import { useAddNotification } from 'services/toastNotification'
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

import BillingControls from './BillingControls/BillingControls'
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
}) => {
  const { provider, owner } = useParams()
  const history = useHistory()
  const addToast = useAddNotification()
  const { mutate, ...rest } = useUpgradePlan({ provider, owner })

  function upgradePlan({ seats, newPlan }) {
    return mutate(
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
          history.push(`/plan/${provider}/${owner}`)
        },
        onError: (error) => {
          addToast({
            type: 'error',
            text: error?.data?.detail || 'Something went wrong',
          })
        },
      }
    )
  }

  const {
    register,
    handleSubmit,
    watch,
    formState,
    setValue,
    getValues,
    reset,
  } = useForm({
    defaultValues: getInitialDataForm({
      accountDetails,
      proPlanYear,
      isSentryUpgrade,
      minSeats,
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
    reset,
    watch,
    upgradePlan,
    ...rest,
  }
}

const PlanDetails = ({ isSentryUpgrade }) => {
  if (!isSentryUpgrade) {
    return null
  }

  return (
    <div>
      <h3 className="font-semibold">Plan</h3>
      <p>14 day free trial, then $29 monthly includes 5 seats.</p>
    </div>
  )
}

PlanDetails.propTypes = {
  isSentryUpgrade: PropTypes.bool,
}

// eslint-disable-next-line complexity
function UpgradeForm({
  proPlanYear,
  proPlanMonth,
  sentryPlanYear,
  sentryPlanMonth,
  accountDetails,
}) {
  const { provider, owner } = useParams()
  const { data: plans } = usePlans(provider)

  const nextBillingDate = getNextBillingDate(accountDetails)
  const isSentryUpgrade = canApplySentryUpgrade({
    plan: accountDetails?.plan?.value,
    plans,
  })
  const minSeats = isSentryUpgrade ? MIN_SENTRY_SEATS : MIN_NB_SEATS
  const trialEndTimestamp = accountDetails?.subscriptionDetail?.trialEnd ?? null
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
  })

  const planString = getValues('newPlan')

  return (
    <form
      className="flex flex-col gap-4 text-ds-gray-nonary"
      onSubmit={handleSubmit(upgradePlan)}
    >
      <div className="flex flex-col">
        <h3 className="text-base font-semibold">Organization</h3>
        <span>{owner}</span>
      </div>
      <PlanDetails isSentryUpgrade={isSentryUpgrade} />
      {/* If not on trial, show the plan details without the credit card prompt */}
      {!trialEndTimestamp ? (
        <>
          <div className="flex flex-col gap-2">
            <BillingControls
              planString={planString}
              isSentryUpgrade={isSentryUpgrade}
              setValue={setValue}
            />
          </div>
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
              accountDetails={accountDetails}
              isSentryUpgrade={isSentryUpgrade}
            />
          </div>
        </>
      ) : trialEndTimestamp && !hasPaymentMethod ? (
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
          <div className="flex flex-col gap-2">
            <BillingControls
              planString={planString}
              isSentryUpgrade={isSentryUpgrade}
              setValue={setValue}
            />
          </div>
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
              accountDetails={accountDetails}
              isSentryUpgrade={isSentryUpgrade}
            />
          </div>
        </>
      )}
    </form>
  )
}

UpgradeForm.propTypes = {
  proPlanYear: planPropType.isRequired,
  proPlanMonth: planPropType.isRequired,
  accountDetails: accountDetailsPropType,
  sentryPlanYear: planPropType,
  sentryPlanMonth: planPropType,
}

export default UpgradeForm
