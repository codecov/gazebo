import PropType from 'prop-types'
import { format, fromUnixTime } from 'date-fns'
import { useForm, Controller } from 'react-hook-form'

import Button from 'components/Button'
import Select from 'components/Select'
import { accountDetailsPropType, planPropType } from 'services/account'

function getInitialDataForm(planOptions, accountDetails) {
  const currentPlan = accountDetails.plan
  const proPlan = planOptions.find((plan) => plan.value === currentPlan?.value)

  return {
    // if the current plan is a proplan, we return it, otherwise select by default the first pro plan
    activePlan: proPlan ? proPlan : planOptions.value[0],
    // get the number of seats of the current plan, but minimum 6 seats
    seats: Math.max(accountDetails.plan?.quantity, 6),
  }
}

function formatNumber(value) {
  // 10000 becomes 10,000 for easier understanding
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

function getNextBillingDate(accountDetails) {
  const timestamp = accountDetails.latest_invoice?.period_end
  return timestamp ? format(fromUnixTime(timestamp), 'MMMM do, yyyy') : null
}

function UpgradePlanForm({
  proPlanYear,
  proPlanMonth,
  accountDetails,
  provider,
  owner,
}) {
  const planOptions = [proPlanYear, proPlanMonth]
  const { register, handleSubmit, watch, control } = useForm({
    defaultValues: getInitialDataForm(planOptions, accountDetails),
  })

  const seats = watch('seats')
  const activePlan = watch('activePlan')

  const perYearPrice = seats * proPlanYear.baseUnitPrice * 12
  const perMonthPrice = seats * proPlanMonth.baseUnitPrice * 12

  const nextBillingDate = getNextBillingDate(accountDetails)

  return (
    <form className="text-gray-900" onSubmit={handleSubmit(console.log)}>
      <h2 className="text-2xl text-pink-500 bold mb-8">
        {proPlanMonth.marketingName}
      </h2>
      <Controller
        name="activePlan"
        control={control}
        render={({ onChange, value }) => {
          return (
            <Select
              items={planOptions}
              renderItem={(plan) => plan.value}
              onChange={onChange}
              value={value}
            />
          )
        }}
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
      {activePlan?.value === 'users-pr-inappy' && (
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
        {activePlan?.value === 'users-pr-inappy' ? (
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
      <Button onClick={console.log} className="w-full block mt-4">
        Continue to Payment
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
