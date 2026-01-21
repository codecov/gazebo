import { Fragment } from 'react'
import { useParams } from 'react-router-dom'

import { MONTHS_PER_YEAR } from 'pages/PlanPage/subRoutes/CurrentOrgPlan/BillingDetails/BillingDetails'
import { useAccountDetails } from 'services/account/useAccountDetails'
import {
  IndividualPlan,
  useAvailablePlans,
} from 'services/account/useAvailablePlans'
import { Provider } from 'shared/api/helpers'
import {
  BillingRate,
  findSentryPlans,
  formatNumberToUSD,
  getNextBillingDate,
} from 'shared/utils/billing'
import {
  calculatePriceSentryPlan,
  calculateSentryNonBundledCost,
  MIN_SENTRY_SEATS,
} from 'shared/utils/upgradeForm'
import Icon from 'ui/Icon'

interface PriceCalloutProps {
  newPlan?: IndividualPlan
  seats: number
}

const PriceCallout: React.FC<PriceCalloutProps> = ({ newPlan, seats }) => {
  const { provider, owner } = useParams<{ provider: Provider; owner: string }>()
  const { data: plans } = useAvailablePlans({ provider, owner })
  const { sentryPlanMonth, sentryPlanYear } = findSentryPlans({ plans })
  const perMonthPrice = calculatePriceSentryPlan({
    seats,
    baseUnitPrice: sentryPlanMonth?.baseUnitPrice,
  })
  const perYearPrice = calculatePriceSentryPlan({
    seats,
    baseUnitPrice: sentryPlanYear?.baseUnitPrice,
  })
  const isPerYear = newPlan?.billingRate === BillingRate.ANNUALLY
  const { data: accountDetails } = useAccountDetails({ provider, owner })
  const nextBillingDate = getNextBillingDate(accountDetails)

  if (seats < MIN_SENTRY_SEATS) {
    return null
  }

  if (isPerYear) {
    const nonBundledCost = calculateSentryNonBundledCost({
      baseUnitPrice: sentryPlanYear?.baseUnitPrice,
    })

    return (
      <div className="bg-ds-gray-primary p-4">
        <p className="pb-3">
          <span className="font-semibold">
            {formatNumberToUSD(perYearPrice)}
          </span>
          /month billed annually at{' '}
          {formatNumberToUSD(perYearPrice * MONTHS_PER_YEAR)}
        </p>
        <p>
          &#127881; You{' '}
          <span className="font-semibold">
            save{' '}
            {formatNumberToUSD(
              nonBundledCost + (perMonthPrice - perYearPrice) * MONTHS_PER_YEAR
            )}
          </span>{' '}
          with the Sentry bundle plan
          {nextBillingDate && (
            <Fragment>
              ,<span className="font-semibold"> next billing date</span> is{' '}
              {nextBillingDate}
            </Fragment>
          )}
        </p>
      </div>
    )
  }

  const nonBundledCost = calculateSentryNonBundledCost({
    baseUnitPrice: sentryPlanMonth?.baseUnitPrice,
  })
  return (
    <div className="bg-ds-gray-primary p-4">
      <p className="pb-3">
        <span className="font-semibold">
          {formatNumberToUSD(perMonthPrice)}
        </span>
        /month
      </p>
      <div className="flex flex-row gap-1">
        <Icon size="sm" name="lightBulb" variant="solid" />
        <p>
          You{' '}
          <span className="font-semibold">
            save {formatNumberToUSD(nonBundledCost)}
          </span>{' '}
          with the Sentry bundle
          {nextBillingDate && (
            <Fragment>
              ,<span className="font-semibold"> next billing date</span> is{' '}
              {nextBillingDate}
            </Fragment>
          )}
        </p>
      </div>
    </div>
  )
}

export default PriceCallout
