import { useParams } from 'react-router-dom'

import { useAvailablePlans } from 'services/account'
import {
  findSentryPlans,
  formatNumberToUSD,
  isAnnualPlan,
  Plans,
} from 'shared/utils/billing'
import {
  calculatePriceSentryPlan,
  calculateSentryNonBundledCost,
} from 'shared/utils/upgradeForm'
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
  const { sentryPlanMonth, sentryPlanYear } = findSentryPlans({ plans })
  const perMonthPrice = calculatePriceSentryPlan({
    seats,
    baseUnitPrice: sentryPlanMonth?.baseUnitPrice,
  })
  const perYearPrice = calculatePriceSentryPlan({
    seats,
    baseUnitPrice: sentryPlanYear?.baseUnitPrice,
  })
  const isPerYear = isAnnualPlan(newPlan)

  if (isPerYear) {
    const nonBundledCost = calculateSentryNonBundledCost({
      baseUnitPrice: sentryPlanYear.baseUnitPrice,
    })

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
            save{' '}
            {formatNumberToUSD(
              nonBundledCost + (perMonthPrice - perYearPrice) * 12
            )}
          </span>{' '}
          with the Sentry bundle plan
        </p>
      </div>
    )
  }

  const nonBundledCost = calculateSentryNonBundledCost({
    baseUnitPrice: sentryPlanMonth.baseUnitPrice,
  })
  return (
    <div className="bg-ds-gray-primary p-4">
      <p className="pb-3">
        <span className="font-semibold">
          {formatNumberToUSD(perMonthPrice)}
        </span>
        /per month
      </p>
      <div className="flex flex-row gap-1">
        <Icon size="sm" name="lightBulb" variant="solid" />
        <p>
          You save{' '}
          <span className="font-semibold">
            {formatNumberToUSD(nonBundledCost)}
          </span>{' '}
          with the Sentry bundle
          {seats > 5 && (
            <>
              , save an{' '}
              <span className="font-semibold">
                additional{' '}
                {formatNumberToUSD((perMonthPrice - perYearPrice) * 12)}
              </span>{' '}
              a year with an annual plan{' '}
              <button
                className="cursor-pointer font-semibold text-ds-blue-darker hover:underline"
                onClick={() => setFormValue('newPlan', Plans.USERS_SENTRYY)}
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
