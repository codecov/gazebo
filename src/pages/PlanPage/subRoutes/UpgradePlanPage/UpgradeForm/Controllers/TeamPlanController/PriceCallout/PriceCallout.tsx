import inRange from 'lodash/inRange'
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
  findTeamPlans,
  formatNumberToUSD,
  getNextBillingDate,
} from 'shared/utils/billing'
import {
  calculatePriceTeamPlan,
  MIN_NB_SEATS_PRO,
  TEAM_PLAN_MAX_ACTIVE_USERS,
} from 'shared/utils/upgradeForm'

interface PriceCalloutProps {
  newPlan?: IndividualPlan
  seats: number
}

const PriceCallout: React.FC<PriceCalloutProps> = ({ newPlan, seats }) => {
  const { provider, owner } = useParams<{ provider: Provider; owner: string }>()
  const { data: plans } = useAvailablePlans({ provider, owner })
  const { data: accountDetails } = useAccountDetails({ provider, owner })
  const { teamPlanMonth, teamPlanYear } = findTeamPlans({ plans })

  // Don't render if no plans are available
  if (!teamPlanMonth && !teamPlanYear) {
    return null
  }

  const perMonthPrice = calculatePriceTeamPlan({
    seats,
    baseUnitPrice: teamPlanMonth?.baseUnitPrice,
  })
  const perYearPrice = calculatePriceTeamPlan({
    seats,
    baseUnitPrice: teamPlanYear?.baseUnitPrice,
  })
  const isPerYear = newPlan?.billingRate === BillingRate.ANNUALLY
  const nextBillingDate = getNextBillingDate(accountDetails)

  if (!inRange(seats, MIN_NB_SEATS_PRO, TEAM_PLAN_MAX_ACTIVE_USERS + 1)) {
    return null
  }

  // Don't render if the required plan variant doesn't exist
  if (isPerYear && !teamPlanYear) {
    return null
  }
  if (!isPerYear && !teamPlanMonth) {
    return null
  }

  if (isPerYear) {
    return (
      <div className="bg-ds-gray-primary p-4">
        <p className="pb-3">
          <span className="font-semibold">
            {formatNumberToUSD(perYearPrice)}
          </span>
          /month billed annually at{' '}
          {formatNumberToUSD(perYearPrice * MONTHS_PER_YEAR)}
        </p>
        {/* Only show savings if both monthly and yearly plans exist */}
        {teamPlanMonth && teamPlanYear && (
          <p>
            &#127881; You{' '}
            <span className="font-semibold">
              save{' '}
              {formatNumberToUSD(
                (perMonthPrice - perYearPrice) * MONTHS_PER_YEAR
              )}
            </span>{' '}
            with annual billing
            {nextBillingDate && (
              <Fragment>
                ,<span className="font-semibold"> next billing date</span> is{' '}
                {nextBillingDate}
              </Fragment>
            )}
          </p>
        )}
        {/* Show next billing date even without savings */}
        {(!teamPlanMonth || !teamPlanYear) && nextBillingDate && (
          <p>
            <span className="font-semibold">Next billing date</span> is{' '}
            {nextBillingDate}
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="bg-ds-gray-primary p-4">
      <p>
        <span className="font-semibold">
          {formatNumberToUSD(perMonthPrice)}
        </span>
        /month
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

export default PriceCallout
