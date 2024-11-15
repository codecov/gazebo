import inRange from 'lodash/inRange'
import { Fragment } from 'react'
import { UseFormSetValue } from 'react-hook-form'
import { useParams } from 'react-router-dom'

import { useAccountDetails, useAvailablePlans } from 'services/account'
import {
  findTeamPlans,
  formatNumberToUSD,
  getNextBillingDate,
  isAnnualPlan,
  PlanName,
  Plans,
} from 'shared/utils/billing'
import {
  calculatePriceTeamPlan,
  MIN_NB_SEATS_PRO,
  TEAM_PLAN_MAX_ACTIVE_USERS,
} from 'shared/utils/upgradeForm'
import Icon from 'ui/Icon'

import { UpgradeFormFields } from '../../../UpgradeForm'

interface PriceCalloutProps {
  newPlan?: PlanName
  seats: number
  setFormValue: UseFormSetValue<UpgradeFormFields>
}

const PriceCallout: React.FC<PriceCalloutProps> = ({
  newPlan,
  seats,
  setFormValue,
}) => {
  const { provider, owner } = useParams<{ provider: string; owner: string }>()
  const { data: plans } = useAvailablePlans({ provider, owner })
  const { teamPlanMonth, teamPlanYear } = findTeamPlans({ plans })
  const perMonthPrice = calculatePriceTeamPlan({
    seats,
    baseUnitPrice: teamPlanMonth?.baseUnitPrice,
  })
  const perYearPrice = calculatePriceTeamPlan({
    seats,
    baseUnitPrice: teamPlanYear?.baseUnitPrice,
  })
  const isPerYear = isAnnualPlan(newPlan)
  const { data: accountDetails } = useAccountDetails({ provider, owner })
  const nextBillingDate = getNextBillingDate(accountDetails)

  if (!inRange(seats, MIN_NB_SEATS_PRO, TEAM_PLAN_MAX_ACTIVE_USERS + 1)) {
    return null
  }

  if (isPerYear) {
    return (
      <div className="bg-ds-gray-primary p-4">
        <p className="pb-3">
          <span className="font-semibold">
            {formatNumberToUSD(perYearPrice)}
          </span>
          /month billed annually at {formatNumberToUSD(perYearPrice * 12)}
        </p>
        <p>
          &#127881; You{' '}
          <span className="font-semibold">
            save {formatNumberToUSD((perMonthPrice - perYearPrice) * 12)}
          </span>{' '}
          with annual billing
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
          You could{' '}
          <span className="font-semibold">
            save {formatNumberToUSD((perMonthPrice - perYearPrice) * 12)}
          </span>{' '}
          a year with annual billing
          {nextBillingDate && (
            <Fragment>
              ,<span className="font-semibold"> next billing date</span> is{' '}
              {nextBillingDate}
            </Fragment>
          )}{' '}
          <button
            className="cursor-pointer font-semibold text-ds-blue-darker hover:underline"
            onClick={() => setFormValue('newPlan', Plans.USERS_TEAMY)}
          >
            switch to annual
          </button>
        </p>
      </div>
    </div>
  )
}

export default PriceCallout
