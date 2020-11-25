import PropType from 'prop-types'

import Button from 'components/Button'
import { accountDetailsPropType, planPropType } from 'services/account'

function getInitialActivePlan({ currentPlan, planOptions }) {
  const proPlan = planOptions.find((plan) => plan.value === currentPlan?.value)
  // if the current plan is a proplan, we return it, otherwise select by default the first pro plan
  return proPlan ? proPlan : planOptions.value[0]
}

function formatNumber(value) {
  // 10000 becomes 10,000 for easier understanding
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

function UpgradePlanForm({
  proPlanYear,
  proPlanMonth,
  accountDetails,
  provider,
  owner,
}) {
  const planOptions = [proPlanYear, proPlanMonth]

  const formData = {
    activePlan: getInitialActivePlan({
      currentPlan: accountDetails.plan,
      planOptions,
    }),
    seats: Math.max(accountDetails.plan?.quantity ?? 0, 6),
  }

  const perYearPrice = formData.seats * proPlanYear.baseUnitPrice * 12
  const perMonthPrice = formData.seats * proPlanMonth.baseUnitPrice * 12

  const nextBillingDate = null

  /* <Dropdown :options="planOptions" @select="selectPlan">
    <PricingElement :plan="formData.activePlan" />
    <template v-slot:option="{ option }">
      <PricingElement :plan="option" />
    </template>
  </Dropdown> */

  return (
    <div className="text-gray-900">
      <h2 className="text-2xl text-pink-500 bold mb-8">
        {proPlanMonth.marketingName}
      </h2>
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
            id="nb-seats"
            size="40"
            className="bg-gray-100 p-2 rounded border"
            type="number"
          />
        </div>
      </div>
      <div
        className="mt-8 pt-8 border-gray-200 border-t"
        v-if="formData.activePlan.value === 'users-pr-inappy'"
      >
        <p className="flex">
          Per month pricing ({formData.seats} users x
          {proPlanMonth.baseUnitPrice})
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
      <div className="mt-8 pt-8 border-gray-200 border-t bold">
        {formData.activePlan.value === 'users-pr-inappy' ? (
          <p className="flex">
            Annual price
            <span className="ml-auto">{formatNumber(perYearPrice)}</span>
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
      {/* <p
        className="bg-error-500 text-error-900 p-3 mt-4 rounded-md"
        :key="error.$property + error.$validator"
        v-for="error of $v.$errors"
      >
        {{ error | formatError }}
      </p> */}
      <Button onClick={console.log} className="w-full block mt-4">
        Continue to Payment
      </Button>
    </div>
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
