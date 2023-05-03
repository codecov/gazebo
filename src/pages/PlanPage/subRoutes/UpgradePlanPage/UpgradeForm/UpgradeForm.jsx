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
  Plans,
} from 'shared/utils/billing'
import {
  calculatePrice,
  getInitialDataForm,
  getSchema,
  MIN_NB_SEATS,
  MIN_SENTRY_SEATS,
  SENTRY_PRICE,
} from 'shared/utils/upgradeForm'
import RadioInput from 'ui/RadioInput/RadioInput'
import TextInput from 'ui/TextInput'

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
      <h3 className="text-base font-semibold">Plan Details</h3>
      <p>
        <span className="font-semibold">14 day free trial</span>, then $29
        monthly includes 5 seats.
      </p>
    </div>
  )
}

PlanDetails.propTypes = {
  isSentryUpgrade: PropTypes.bool,
}

const RadioInputHeader = ({ isSentryUpgrade }) => {
  if (isSentryUpgrade) {
    return <h3 className="font-semibold">Additional seats</h3>
  }

  return <h3 className="font-semibold">Billing</h3>
}

RadioInputHeader.propTypes = {
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

  return (
    <form
      className="flex flex-col gap-4 text-ds-gray-nonary"
      onSubmit={handleSubmit(upgradePlan)}
    >
      <div className="flex flex-col gap-2">
        <h3 className="font-semibold">Organization</h3>
        <span>{owner}</span>
      </div>
      <PlanDetails isSentryUpgrade={isSentryUpgrade} />
      <div className="flex flex-col gap-2">
        <RadioInputHeader isSentryUpgrade={isSentryUpgrade} />
        <RadioInput
          key={proPlanYear?.billingRate}
          data-cy={`select-${proPlanYear?.billingRate}`}
          dataMarketing={`plan-pricing-option-${proPlanYear?.billingRate}`}
          label={
            <p>
              <span className="font-semibold">
                ${proPlanYear?.baseUnitPrice}
              </span>
              /per seat, billed {proPlanYear?.billingRate}
            </p>
          }
          name="billing-options"
          value={isSentryUpgrade ? Plans.USERS_SENTRYY : Plans.USERS_PR_INAPPY}
          {...register('newPlan')}
        />
        <RadioInput
          key={proPlanMonth?.billingRate}
          data-cy={`select-${proPlanMonth?.billingRate}`}
          dataMarketing={`plan-pricing-option-${proPlanMonth?.billingRate}`}
          label={
            <p>
              <span className="font-semibold">
                ${proPlanMonth?.baseUnitPrice}
              </span>
              /per seat, billed {proPlanMonth?.billingRate}
            </p>
          }
          name="billing-options"
          value={isSentryUpgrade ? Plans.USERS_SENTRYM : Plans.USERS_PR_INAPPM}
          {...register('newPlan')}
        />
      </div>
      <div className="flex flex-col gap-2 xl:w-5/12">
        <TextInput
          data-cy="seats"
          dataMarketing="plan-pricing-seats"
          {...register('seats')}
          id="nb-seats"
          size="20"
          className="w-full rounded border bg-ds-gray-secondary p-2"
          type="number"
          label="Seat count"
          min={minSeats}
        />
        <UserCount
          activatedStudentCount={accountDetails?.activatedStudentCount}
          activatedUserCount={accountDetails?.activatedUserCount}
          inactiveUserCount={accountDetails?.inactiveUserCount}
        />
      </div>
      <TotalBanner
        isPerYear={isPerYear}
        perYearPrice={perYearPrice}
        perMonthPrice={perMonthPrice}
        setValue={setValue}
        isSentryUpgrade={isSentryUpgrade}
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
      <div>
        <UpdateButton
          isValid={isValid}
          getValues={getValues}
          value={accountDetails?.plan?.value}
          quantity={accountDetails?.plan?.quantity}
          accountDetails={accountDetails}
          isSentryUpgrade={isSentryUpgrade}
        />
      </div>
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
