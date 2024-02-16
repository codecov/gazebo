import { Fragment } from 'react'
import { useParams } from 'react-router-dom'

import { useAccountDetails, useAvailablePlans } from 'services/account'
import {
  findProPlans,
  formatNumberToUSD,
  getNextBillingDate,
  isAnnualPlan,
  Plans,
} from 'shared/utils/billing'
import { calculatePriceProPlan } from 'shared/utils/upgradeForm'
import Icon from 'ui/Icon'

import { NewPlanType } from '../../../constants'

interface PriceCalloutProps {
  newPlan: NewPlanType
  seats: number
  setFormValue: (x: string, y: string) => void
}

const PriceCallout: React.FC<PriceCalloutProps> = ({
  newPlan,
  seats,
  setFormValue,
}) => {
  const { provider, owner } = useParams<{ provider: string; owner: string }>()
  const { data: plans } = useAvailablePlans({ provider, owner })
  const { proPlanMonth, proPlanYear } = findProPlans({ plans })
  const perMonthPrice = calculatePriceProPlan({
    seats,
    baseUnitPrice: proPlanMonth?.baseUnitPrice,
  })
  const perYearPrice = calculatePriceProPlan({
    seats,
    baseUnitPrice: proPlanYear?.baseUnitPrice,
  })
  const isPerYear = isAnnualPlan(newPlan)

  const { data: accountDetails } = useAccountDetails({ provider, owner })
  const nextBillingDate = getNextBillingDate(accountDetails)

  if (isPerYear) {
    return (
      <div className="bg-ds-gray-primary p-4">
        <p className="pb-3">
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
        /per month{' '}
      </p>
      <div className="flex flex-row gap-1">
        <Icon size="sm" name="lightBulb" variant="solid" />
        <p>
          You could save{' '}
          <span className="font-semibold">
            {formatNumberToUSD((perMonthPrice - perYearPrice) * 12)}
          </span>{' '}
          a year with annual billing
          {nextBillingDate && (
            <Fragment>
              ,<span className="font-semibold"> next billing date</span> is{' '}
              {nextBillingDate}
            </Fragment>
          )}
          <button
            className="cursor-pointer font-semibold text-ds-blue-darker hover:underline"
            onClick={() => setFormValue('newPlan', Plans.USERS_PR_INAPPY)}
          >
            switch to annual
          </button>
        </p>
      </div>
    </div>
  )
}

export default PriceCallout
