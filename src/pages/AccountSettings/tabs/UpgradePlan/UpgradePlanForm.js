import { yupResolver } from '@hookform/resolvers/yup'
import { format, fromUnixTime } from 'date-fns'
import PropType from 'prop-types'
import { Controller, useForm } from 'react-hook-form'
import { useHistory } from 'react-router-dom'
import * as yup from 'yup'

import Select from 'old_ui/Select'
import {
  accountDetailsPropType,
  planPropType,
  useUpgradePlan,
} from 'services/account'
import { useAddNotification } from 'services/toastNotification'
import Button from 'ui/Button'

const MIN_NB_SEATS = 6

function getInitialDataForm(planOptions, accountDetails) {
  const currentPlan = accountDetails.plan
  const proPlan = planOptions.find((plan) => plan.value === currentPlan?.value)

  const currentNbSeats = accountDetails.plan?.quantity ?? MIN_NB_SEATS

  return {
    // if the current plan is a proplan, we return it, otherwise select by default the first pro plan
    newPlan: proPlan ? proPlan : planOptions[0],
    // get the number of seats of the current plan, but minimum 6 seats
    seats: Math.max(currentNbSeats, MIN_NB_SEATS),
  }
}

function formatNumber(value) {
  // 10000 becomes 10,000 for easier understanding
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

function getNextBillingDate(accountDetails) {
  const timestamp = accountDetails.latestInvoice?.periodEnd
  return timestamp ? format(fromUnixTime(timestamp), 'MMMM do, yyyy') : null
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
        test: (nbSeats) => nbSeats >= accountDetails.activatedUserCount,
        message: 'Must deactivate more users before downgrading plans',
      })
      .nullable()
      .transform((value, originalValue) =>
        String(originalValue).trim() === '' ? null : value
      ),
  })
}

function useUpgradeForm({ proPlanYear, proPlanMonth, accountDetails }) {
  const planOptions = [proPlanYear, proPlanMonth]
  const { register, handleSubmit, watch, control, formState } = useForm({
    defaultValues: getInitialDataForm(planOptions, accountDetails),
    resolver: yupResolver(getSchema(accountDetails)),
    mode: 'onChange',
  })

  const seats = watch('seats')
  const newPlan = watch('newPlan')

  const perYearPrice = Math.floor(seats) * proPlanYear.baseUnitPrice * 12
  const perMonthPrice = Math.floor(seats) * proPlanMonth.baseUnitPrice * 12

  const isPerYear = newPlan?.value === 'users-pr-inappy'

  return {
    seats,
    newPlan,
    perYearPrice,
    perMonthPrice,
    register,
    handleSubmit,
    control,
    isPerYear,
    planOptions,
    formState,
  }
}

function useSubmit({ owner, provider }) {
  const redirect = useHistory().push
  const addToast = useAddNotification()
  const { mutate, ...rest } = useUpgradePlan({ provider, owner })

  function upgradePlan(newPlan) {
    return mutate(newPlan, {
      onSuccess: () => {
        addToast({
          type: 'success',
          text: 'Plan successfully upgraded',
        })
        redirect(`/account/${provider}/${owner}/billing`)
      },
      onError: (error) =>
        addToast({
          type: 'error',
          text: error?.data?.detail || 'Something went wrong',
        }),
    })
  }

  return { upgradePlan, ...rest }
}

function renderStudentText(activatedStudents) {
  return (
    <p className="mb-4 text-xs">
      {activatedStudents === 1
        ? `*You have ${activatedStudents} active student that
        does not count towards the number of active users.`
        : `*You have ${activatedStudents} active students that
        do not count towards the number of active users.`}
    </p>
  )
}

function UpgradePlanForm({
  proPlanYear,
  proPlanMonth,
  accountDetails,
  provider,
  owner,
}) {
  const nextBillingDate = getNextBillingDate(accountDetails)

  const {
    seats,
    perYearPrice,
    perMonthPrice,
    register,
    handleSubmit,
    control,
    isPerYear,
    planOptions,
    formState: { isValid, errors },
  } = useUpgradeForm({ proPlanYear, proPlanMonth, accountDetails })

  const { upgradePlan } = useSubmit({ owner, provider })
  return (
    <form
      className="text-ds-gray-nonary flex flex-col gap-8"
      onSubmit={handleSubmit(upgradePlan)}
    >
      <h3 className="text-2xl text-ds-pink-quinary bold">
        {proPlanMonth.marketingName}
      </h3>
      <Controller
        name="newPlan"
        control={control}
        render={({ field }) => (
          // TODO: Still need to change this select to New UI Select
          <Select
            data-cy="plan-pricing"
            items={planOptions}
            renderItem={(plan) => (
              <div
                className="flex justify-between flex-1 p-2 text-base w-full"
                data-cy={`select-${plan.billingRate}`}
              >
                <span className="capitalize text-gray-600">
                  {plan.billingRate} User Pricing
                </span>
                <span>${plan.baseUnitPrice} /month</span>
              </div>
            )}
            onChange={field.onChange}
            value={field.value}
          />
        )}
      />
      <hr />
      <div className="flex flex-col gap-2">
        <p>
          {accountDetails.activatedUserCount} active users.{' '}
          {accountDetails.inactiveUserCount} seats needed to activate all users.
        </p>
        {renderStudentText(accountDetails.activatedStudentCount)}
        <div className="flex gap-4 items-center">
          <label htmlFor="nb-seats" className="flex-none cursor-pointer">
            User Seats:
          </label>
          <input
            data-cy="seats"
            {...register('seats')}
            id="nb-seats"
            size="20"
            className="bg-ds-gray-secondary p-2 rounded border w-full"
            type="number"
          />
        </div>
      </div>
      {isPerYear && (
        <div className="flex flex-col gap-1">
          <div className="flex justify-between">
            <p>
              {' '}
              Per month pricing ({seats} users x{proPlanMonth.baseUnitPrice})
            </p>
            <p data-test="normal-price-month">${formatNumber(perMonthPrice)}</p>
          </div>
          <div className="flex justify-between">
            <p> - 16.67% Annual Discount </p>
            <p data-test="year-discount-value">
              ${formatNumber(perMonthPrice - perYearPrice)}
            </p>
          </div>
        </div>
      )}
      <hr />
      <div className="border-gray-200">
        {isPerYear ? (
          <p className="flex">
            Annual price
            <span className="ml-auto">${formatNumber(perYearPrice)}</span>
          </p>
        ) : (
          <p className="flex">
            Monthly price
            <span className="ml-auto">${formatNumber(perMonthPrice / 12)}</span>
          </p>
        )}
      </div>
      {nextBillingDate && (
        <p className="flex blod mt-1">
          Next Billing Date
          <span className="ml-auto">{nextBillingDate}</span>
        </p>
      )}
      {errors?.seats && (
        <p className="bg-ds-error-quinary text-ds-error-nonary p-3 rounded-md">
          {errors.seats?.message}
        </p>
      )}
      <hr />
      <Button
        hook="update-plan"
        data-cy="update"
        disabled={!isValid}
        type="submit"
        variant="primary"
      >
        Update
      </Button>
    </form>
  )
}

UpgradePlanForm.propTypes = {
  proPlanYear: planPropType.isRequired,
  proPlanMonth: planPropType.isRequired,
  accountDetails: accountDetailsPropType,
  provider: PropType.string.isRequired,
  owner: PropType.string.isRequired,
}

export default UpgradePlanForm
