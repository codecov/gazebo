import { Fragment } from 'react'
import { UseFormSetValue } from 'react-hook-form'
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
  findProPlans,
  formatNumberToUSD,
  getNextBillingDate,
} from 'shared/utils/billing'
import {
  calculatePriceProPlan,
  MIN_NB_SEATS_PRO,
} from 'shared/utils/upgradeForm'
import Icon from 'ui/Icon'

import { UpgradeFormFields } from '../../../UpgradeForm'

interface PriceCalloutProps {
  newPlan?: IndividualPlan
  seats: number
  setFormValue: UseFormSetValue<UpgradeFormFields>
}

const PriceCallout: React.FC<PriceCalloutProps> = ({
  newPlan,
  seats,
  setFormValue,
}) => {
  const { provider, owner } = useParams<{ provider: Provider; owner: string }>()
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
  const isPerYear = newPlan?.billingRate === BillingRate.ANNUALLY

  const { data: accountDetails } = useAccountDetails({ provider, owner })
  const nextBillingDate = getNextBillingDate(accountDetails)

  if (seats < MIN_NB_SEATS_PRO) {
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
            save{' '}
            {formatNumberToUSD(
              (perMonthPrice - perYearPrice) * MONTHS_PER_YEAR
            )}
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
            onClick={() => setFormValue('newPlan', proPlanYear)}
          >
            switch to annual
          </button>
        </p>
      </div>
    </div>
  )
}

export default PriceCallout
