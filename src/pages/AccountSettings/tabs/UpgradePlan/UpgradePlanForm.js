import PropType from 'prop-types'
import { format, fromUnixTime } from 'date-fns'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useHistory } from 'react-router-dom'

import Button from 'ui/Button'
import Select from 'ui/Select'
import {
  accountDetailsPropType,
  planPropType,
  useUpgradePlan,
} from 'services/account'
import { useAddNotification } from 'services/toastNotification'

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

  const { register, handleSubmit, watch, control, errors, formState } = useForm(
    {
      defaultValues: getInitialDataForm(planOptions, accountDetails),
      resolver: yupResolver(getSchema(accountDetails)),
    }
  )

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
    errors,
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
      onError: () =>
        addToast({
          type: 'error',
          text: 'Something went wrong',
        }),
    })
  }

  return { upgradePlan, ...rest }
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
    errors,
    planOptions,
    formState: { isDirty },
  } = useUpgradeForm({ proPlanYear, proPlanMonth, accountDetails })

  const { upgradePlan } = useSubmit({ owner, provider })

  return (
    <form className="text-gray-900" onSubmit={handleSubmit(upgradePlan)}>
      <h2 className="text-2xl text-pink-500 bold mb-8">
        {proPlanMonth.marketingName}
      </h2>
      <Controller
        name="newPlan"
        control={control}
        render={({ onChange, value }) => (
          <Select
            items={planOptions}
            renderItem={(plan) => (
              <div className="flex justify-between flex-1 p-2 text-base w-full">
                <span className="capitalize text-gray-600">
                  {plan.billingRate} User Pricing
                </span>
                <span>${plan.baseUnitPrice} /month</span>
              </div>
            )}
            onChange={onChange}
            value={value}
          />
        )}
      />
      <div className="mt-8 pt-8 border-gray-200 border-t">
        <p className="mb-4">
          {accountDetails.activatedUserCount} active users.{' '}
          {accountDetails.inactiveUserCount} seats needed to activate all users.
        </p>
        <div className="flex items-center">
          <label htmlFor="nb-seats" className="flex-none cursor-pointer pr-2">
            User Seats:
          </label>
          <input
            ref={register}
            id="nb-seats"
            name="seats"
            size="40"
            className="bg-gray-100 p-2 rounded border"
            type="number"
          />
        </div>
      </div>
      {isPerYear && (
        <div className="mt-8 pt-8 border-gray-200 border-t">
          <p className="flex">
            Per month pricing ({seats} users x{proPlanMonth.baseUnitPrice})
            <span className="ml-auto" data-test="normal-price-month">
              ${formatNumber(perMonthPrice)}
            </span>
          </p>
          <p className="flex mt-1">
            - 16.67% Annual Discount
            <span className="ml-auto" data-test="year-discount-value">
              ${formatNumber(perMonthPrice - perYearPrice)}
            </span>
          </p>
        </div>
      )}
      <div className="mt-8 pt-8 border-gray-200 border-t bold">
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
      {errors.seats && (
        <p className="bg-error-500 text-error-900 p-3 mt-4 rounded-md">
          {errors.seats?.message}
        </p>
      )}
      <Button disabled={!isDirty} type="submit" className="w-full block mt-4">
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
