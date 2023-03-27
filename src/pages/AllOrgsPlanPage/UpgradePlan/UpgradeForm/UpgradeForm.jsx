import PropTypes from 'prop-types'
import { useEffect } from 'react'
import { useParams } from 'react-router-dom'

import {
  accountDetailsPropType,
  planPropType,
  usePlans,
} from 'services/account'
import {
  canApplySentryUpgrade,
  getNextBillingDate,
  Plans,
} from 'shared/utils/billing'
import { getInitialDataForm } from 'shared/utils/upgradeForm'
import RadioInput from 'ui/RadioInput/RadioInput'
import TextInput from 'ui/TextInput'

import { useUpgradeForm } from './hooks'
import TotalBanner from './TotalBanner'
import UpdateButton from './UpdateButton'
import UserCount from './UserCount'

const MIN_NB_SEATS = 2
const MIN_SENTRY_SEATS = 5
const SENTRY_PRICE = 29

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
    reset,
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
    organizationName,
  })

  let disableInputs = true
  if (!!organizationName && !!accountDetails) {
    disableInputs = false
  }

  useEffect(() => {
    if (organizationName && accountDetails) {
      reset({
        ...getInitialDataForm({
          accountDetails,
          proPlanYear,
          sentryPlanYear,
          isSentryUpgrade,
          minSeats,
        }),
      })
    }
  }, [
    reset,
    organizationName,
    proPlanYear,
    proPlanMonth,
    accountDetails,
    minSeats,
    sentryPlanYear,
    isSentryUpgrade,
  ])

  return (
    <form
      className="flex flex-col gap-4 pt-4 text-ds-gray-nonary"
      onSubmit={handleSubmit(upgradePlan)}
    >
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
          disabled={disableInputs}
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
          disabled={disableInputs}
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
          disabled={disableInputs}
          min={minSeats}
        />
        <UserCount
          activatedStudentCount={accountDetails?.activatedStudentCount}
          activatedUserCount={accountDetails?.activatedUserCount}
          inactiveUserCount={accountDetails?.inactiveUserCount}
        />
      </div>
      {!disableInputs && (
        <TotalBanner
          isPerYear={isPerYear}
          perYearPrice={perYearPrice}
          perMonthPrice={perMonthPrice}
          setValue={setValue}
          isSentryUpgrade={isSentryUpgrade}
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
      <div className="w-min">
        <UpdateButton
          isValid={isValid}
          getValues={getValues}
          value={accountDetails?.plan?.value}
          quantity={accountDetails?.plan?.quantity}
          disableInputs={disableInputs}
        />
      </div>
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
