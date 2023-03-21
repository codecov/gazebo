import { yupResolver } from '@hookform/resolvers/yup'
import PropTypes from 'prop-types'
import { useForm } from 'react-hook-form'
import { useHistory, useParams } from 'react-router-dom'
import * as yup from 'yup'

import {
  accountDetailsPropType,
  planPropType,
  useUpgradePlan,
} from 'services/account'
import { useAddNotification } from 'services/toastNotification'
import {
  formatNumberToUSD,
  getNextBillingDate,
  isSentryPlan,
  Plans,
} from 'shared/utils/billing'
import Button from 'ui/Button'
import Icon from 'ui/Icon'
import RadioInput from 'ui/RadioInput/RadioInput'
import TextInput from 'ui/TextInput'

const MIN_NB_SEATS = 5

function getInitialDataForm(sentryPlanYear, accountDetails) {
  const plan = accountDetails?.plan
  const currentNbSeats = plan?.quantity ?? MIN_NB_SEATS

  return {
    newPlan: isSentryPlan(plan?.value) ? plan?.value : sentryPlanYear?.value,
    // get the number of seats of the current plan, but minimum 5 seats
    seats: Math.max(currentNbSeats, MIN_NB_SEATS),
  }
}

function getSchema(accountDetails) {
  return yup.object().shape({
    seats: yup
      .number()
      .required('Number of seats is required')
      .integer()
      .min(
        MIN_NB_SEATS,
        `You cannot purchase a per user plan for less than ${MIN_NB_SEATS} users`
      )
      .test({
        name: 'between',
        test: (nbSeats) => nbSeats >= accountDetails?.activatedUserCount,
        message: 'Must deactivate more users before downgrading plans',
      })
      .nullable()
      .transform((value, originalValue) =>
        String(originalValue).trim() === '' ? null : value
      ),
  })
}

// eslint-disable-next-line max-statements
function useUpgradeForm({ sentryPlanMonth, sentryPlanYear, accountDetails }) {
  const planOptions = [sentryPlanYear, sentryPlanMonth]

  const values = getInitialDataForm(sentryPlanYear, accountDetails)

  const {
    register,
    handleSubmit,
    watch,
    formState,
    setValue,
    getValues,
    reset,
  } = useForm({
    defaultValues: values,
    resolver: yupResolver(getSchema(accountDetails)),
    mode: 'onChange',
  })

  const seats = watch('seats')
  const newPlan = watch('newPlan')

  let perYearPrice = 29.99
  if (seats > 5) {
    perYearPrice += Math.floor(seats - 5) * sentryPlanYear?.baseUnitPrice
  }

  let perMonthPrice = 29.99
  if (seats > 5) {
    perMonthPrice += Math.floor(seats - 5) * sentryPlanMonth?.baseUnitPrice
  }

  const isPerYear = newPlan === Plans.USERS_SENTRYY

  return {
    seats,
    newPlan,
    perYearPrice,
    perMonthPrice,
    register,
    handleSubmit,
    isPerYear,
    planOptions,
    formState,
    setValue,
    getValues,
    reset,
  }
}

function useSubmit({ owner, provider }) {
  const redirect = useHistory().push
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
          redirect(`/plan/${provider}/${owner}`)
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

  return { upgradePlan, ...rest }
}

function renderStudentText(activatedStudents) {
  if (activatedStudents < 1) {
    return null
  }

  return (
    <p className="mb-4 text-xs text-ds-gray-quinary">
      {activatedStudents === 1
        ? `*You have ${activatedStudents} active student that
        does not count towards the number of active users.`
        : `*You have ${activatedStudents} active students that
        do not count towards the number of active users.`}
    </p>
  )
}

function UpdateButton({ isValid, getValues, accountDetails }) {
  return (
    <Button
      data-cy="update"
      disabled={
        !isValid ||
        (getValues()?.newPlan === accountDetails?.plan?.value &&
          getValues()?.seats === accountDetails?.plan?.quantity)
      }
      type="submit"
      variant="primary"
      hook="submit-upgrade"
    >
      Update
    </Button>
  )
}

UpdateButton.propTypes = {
  isValid: PropTypes.bool,
  getValues: PropTypes.func,
  accountDetails: PropTypes.object,
}

function TotalBanner({ isPerYear, perYearPrice, perMonthPrice, setValue }) {
  if (isPerYear) {
    return (
      <div className="flex flex-col gap-3">
        <p>
          <span className="font-semibold">
            {formatNumberToUSD(perYearPrice)}
          </span>
          /per month billed annually at {formatNumberToUSD(perYearPrice * 12)}
        </p>
        <p>
          &#127881; You{' '}
          <span className="font-semibold">
            save {formatNumberToUSD((perMonthPrice - perYearPrice) * 12)}
          </span>{' '}
          with the annual plan
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <p>
        <span className="font-semibold">
          {formatNumberToUSD(perMonthPrice)}
        </span>
        /per month
      </p>
      <div className="flex flex-row gap-1">
        <Icon size="sm" name="light-bulb" variant="solid" />
        <p>
          You could save{' '}
          <span className="font-semibold">
            {formatNumberToUSD((perMonthPrice - perYearPrice) * 12)}
          </span>{' '}
          a year with the annual plan,{' '}
          <button
            className="cursor-pointer font-semibold text-ds-blue-darker hover:underline"
            onClick={() => setValue('newPlan', Plans.USERS_SENTRYY)}
          >
            switch to annual
          </button>
        </p>
      </div>
    </div>
  )
}

TotalBanner.propTypes = {
  setValue: PropTypes.func,
  isPerYear: PropTypes.bool,
  perYearPrice: PropTypes.number,
  perMonthPrice: PropTypes.number,
}

function SentryUpgradeForm({
  accountDetails,
  sentryPlanYear,
  sentryPlanMonth,
}) {
  const { provider, owner } = useParams()
  const nextBillingDate = getNextBillingDate(accountDetails)

  const {
    perYearPrice,
    perMonthPrice,
    register,
    handleSubmit,
    isPerYear,
    setValue,
    getValues,
    formState: { isValid, errors },
  } = useUpgradeForm({ sentryPlanYear, sentryPlanMonth, accountDetails })

  const { upgradePlan } = useSubmit({ owner, provider })
  return (
    <form
      className="flex flex-col gap-4 pt-4 text-ds-gray-nonary"
      onSubmit={handleSubmit(upgradePlan)}
    >
      <div>
        <h2 className="text-lg font-semibold">Plan Details</h2>
        <p>
          <span className="font-semibold">
            {sentryPlanYear?.trialDays} day free trial
          </span>
          , then $29.99 monthly includes 5 seats.
        </p>
      </div>
      <div>
        <h3 className="pb-2 font-semibold">Additional Seats</h3>
        <div className="flex flex-col gap-2">
          <RadioInput
            key={sentryPlanYear?.billingRate}
            data-cy={`select-${sentryPlanYear?.billingRate}`}
            dataMarketing={`plan-pricing-option-${sentryPlanYear?.billingRate}`}
            label={
              <>
                <span className="font-semibold">
                  ${sentryPlanYear?.baseUnitPrice}
                </span>
                /per seat, billed {sentryPlanYear?.billingRate}
              </>
            }
            name="billing-options"
            value={Plans.USERS_SENTRYY}
            {...register('newPlan')}
          />
          <RadioInput
            key={sentryPlanMonth?.billingRate}
            data-cy={`select-${sentryPlanMonth?.billingRate}`}
            dataMarketing={`plan-pricing-option-${sentryPlanMonth?.billingRate}`}
            label={
              <>
                <span className="font-semibold">
                  ${sentryPlanMonth?.baseUnitPrice}
                </span>
                /per seat, billed {sentryPlanMonth?.billingRate}
              </>
            }
            name="billing-options"
            value={Plans.USERS_SENTRYM}
            {...register('newPlan')}
          />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <div className="xl:w-5/12">
          <TextInput
            data-cy="seats"
            dataMarketing="plan-pricing-seats"
            {...register('seats')}
            id="nb-seats"
            size="20"
            className="w-full rounded border bg-ds-gray-secondary p-2"
            type="number"
            label="Seat count"
          />
        </div>
        {accountDetails && (
          <div className="border-l-2 pl-2">
            <p>
              Currently {accountDetails?.activatedUserCount} users activated out
              of{' '}
              {accountDetails?.activatedUserCount +
                accountDetails?.inactiveUserCount}{' '}
              users.
            </p>
            {renderStudentText(accountDetails?.activatedStudentCount)}
          </div>
        )}
      </div>
      {accountDetails && (
        <div className="bg-ds-gray-primary p-4">
          <TotalBanner
            isPerYear={isPerYear}
            perYearPrice={perYearPrice}
            perMonthPrice={perMonthPrice}
            setValue={setValue}
            sentryPlanYear={sentryPlanYear}
          />
        </div>
      )}
      {nextBillingDate && (
        <p className="mt-1 flex">
          Next Billing Date
          <span className="ml-auto">{nextBillingDate}</span>
        </p>
      )}
      {errors?.seats && (
        <p className="rounded-md bg-ds-error-quinary p-3 text-ds-error-nonary">
          {errors.seats?.message}
        </p>
      )}
      <div className="w-min">
        <UpdateButton
          isValid={isValid}
          getValues={getValues}
          accountDetails={accountDetails}
        />
      </div>
    </form>
  )
}

SentryUpgradeForm.propTypes = {
  sentryPlanYear: planPropType,
  sentryPlanMonth: planPropType,
  accountDetails: accountDetailsPropType,
  organizationName: PropTypes.string,
}

export default SentryUpgradeForm
