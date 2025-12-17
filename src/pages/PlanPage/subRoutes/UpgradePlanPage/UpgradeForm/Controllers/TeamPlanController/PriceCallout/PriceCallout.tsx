import inRange from 'lodash/inRange'
import { Fragment } from 'react'
import { useParams } from 'react-router-dom'

import { useAccountDetails } from 'services/account/useAccountDetails'
import { useAvailablePlans } from 'services/account/useAvailablePlans'
import { Provider } from 'shared/api/helpers'
import {
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
  seats: number
}

const PriceCallout: React.FC<PriceCalloutProps> = ({ seats }) => {
  const { provider, owner } = useParams<{ provider: Provider; owner: string }>()
  const { data: plans } = useAvailablePlans({ provider, owner })
  const { teamPlanMonth } = findTeamPlans({ plans })
  const perMonthPrice = calculatePriceTeamPlan({
    seats,
    baseUnitPrice: teamPlanMonth?.baseUnitPrice,
  })
  const { data: accountDetails } = useAccountDetails({ provider, owner })
  const nextBillingDate = getNextBillingDate(accountDetails)

  if (!inRange(seats, MIN_NB_SEATS_PRO, TEAM_PLAN_MAX_ACTIVE_USERS + 1)) {
    return null
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
