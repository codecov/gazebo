import PropTypes from 'prop-types'
import { useParams } from 'react-router-dom'

import { usePlans } from 'services/account'
import { findSentryPlans, formatNumberToUSD, Plans } from 'shared/utils/billing'
import { calculateNonBundledCost } from 'shared/utils/upgradeForm'
import Icon from 'ui/Icon'

interface SentryBannerProps {
  isPerYear: boolean
  perYearPrice: number
  perMonthPrice: number
  setValue: (x: string, y: string) => void
  seats: number
}

const SentryBanner: React.FC<SentryBannerProps> = ({
  isPerYear,
  perYearPrice,
  perMonthPrice,
  setValue,
  seats,
}) => {
  const { provider } = useParams<{ provider: string }>()
  const { data: plans } = usePlans(provider)
  const { sentryPlanMonth, sentryPlanYear } = findSentryPlans({ plans })

  if (isPerYear) {
    const nonBundledCost = calculateNonBundledCost({
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

  const nonBundledCost = calculateNonBundledCost({
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
                onClick={() => setValue('newPlan', Plans.USERS_SENTRYY)}
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

SentryBanner.propTypes = {
  setValue: PropTypes.func.isRequired,
  isPerYear: PropTypes.bool.isRequired,
  perYearPrice: PropTypes.number.isRequired,
  perMonthPrice: PropTypes.number.isRequired,
  seats: PropTypes.number.isRequired,
}

interface TotalBannerProps {
  isPerYear: boolean
  perYearPrice: number
  perMonthPrice: number
  setValue: (x: string, y: string) => void
  isSentryUpgrade: boolean
  seats: number
}

const TotalBanner: React.FC<TotalBannerProps> = ({
  isPerYear,
  perYearPrice,
  perMonthPrice,
  setValue,
  isSentryUpgrade,
  seats,
}) => {
  if (isSentryUpgrade) {
    return (
      <SentryBanner
        isPerYear={isPerYear}
        perYearPrice={perYearPrice}
        perMonthPrice={perMonthPrice}
        seats={seats}
        setValue={setValue}
      />
    )
  }

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
          with the annual plan
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
        /per month
      </p>
      <div className="flex flex-row gap-1">
        <Icon size="sm" name="lightBulb" variant="solid" />
        <p>
          You could save{' '}
          <span className="font-semibold">
            {formatNumberToUSD((perMonthPrice - perYearPrice) * 12)}
          </span>{' '}
          a year with the annual plan,{' '}
          <button
            className="cursor-pointer font-semibold text-ds-blue-darker hover:underline"
            onClick={() => setValue('newPlan', Plans.USERS_PR_INAPPY)}
          >
            switch to annual
          </button>
        </p>
      </div>
    </div>
  )
}

TotalBanner.propTypes = {
  setValue: PropTypes.func.isRequired,
  isPerYear: PropTypes.bool.isRequired,
  perYearPrice: PropTypes.number.isRequired,
  perMonthPrice: PropTypes.number.isRequired,
  isSentryUpgrade: PropTypes.bool.isRequired,
  seats: PropTypes.number.isRequired,
}

export default TotalBanner
