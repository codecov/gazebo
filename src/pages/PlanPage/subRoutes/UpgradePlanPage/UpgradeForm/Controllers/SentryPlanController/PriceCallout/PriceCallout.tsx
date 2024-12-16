import { Fragment } from 'react'
import { UseFormSetValue } from 'react-hook-form'
import { useParams } from 'react-router-dom'

import { useAccountDetails, useAvailablePlans } from 'services/account'
import {
  BillingRate,
  findSentryPlans,
  formatNumberToUSD,
  getNextBillingDate,
  Plan,
} from 'shared/utils/billing'
import {
  calculatePriceSentryPlan,
  calculateSentryNonBundledCost,
  MIN_SENTRY_SEATS,
} from 'shared/utils/upgradeForm'
import Icon from 'ui/Icon'

import { UpgradeFormFields } from '../../../UpgradeForm'

interface PriceCalloutProps {
  newPlan?: Plan
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
          /month billed annually at {formatNumberToUSD(perYearPrice * 12)}
        </p>
        <p>
          &#127881; You{' '}
          <span className="font-semibold">
            save{' '}
            {formatNumberToUSD(
              nonBundledCost + (perMonthPrice - perYearPrice) * 12
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
          {seats > 5 && (
            <>
              , save an{' '}
              <span className="font-semibold">
                additional{' '}
                {formatNumberToUSD((perMonthPrice - perYearPrice) * 12)}
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
                onClick={() => setFormValue('newPlan', sentryPlanYear)}
              >
                switch to annual
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  )
}

export default PriceCallout
