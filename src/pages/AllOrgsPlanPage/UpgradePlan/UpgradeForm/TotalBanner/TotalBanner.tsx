import PropTypes from 'prop-types'

import { formatNumberToUSD, Plans } from 'shared/utils/billing'
import Icon from 'ui/Icon'

interface TotalBannerProps {
  isPerYear: boolean
  perYearPrice: number
  perMonthPrice: number
  setValue: (x: string, y: string) => void
  isSentryUpgrade: boolean
}

const TotalBanner: React.FC<TotalBannerProps> = ({
  isPerYear,
  perYearPrice,
  perMonthPrice,
  setValue,
  isSentryUpgrade,
}) => {
  if (isPerYear) {
    return (
      <div className="flex flex-col gap-3">
        <p>
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

  const annualPlan = isSentryUpgrade
    ? Plans.USERS_SENTRYY
    : Plans.USERS_PR_INAPPY

  return (
    <div className="flex flex-col gap-3">
      <p>
        <span className="font-semibold">
          {formatNumberToUSD(perMonthPrice)}
        </span>
        /per month
      </p>
      <div className="flex flex-row gap-1">
        <Icon size="sm" name="light-bulb" variant="solid" />
        <p>
          You could save{' '}
          <span className="font-semibold">
            {formatNumberToUSD((perMonthPrice - perYearPrice) * 12)}
          </span>{' '}
          a year with the annual plan,{' '}
          <button
            className="cursor-pointer font-semibold text-ds-blue-darker hover:underline"
            onClick={() => setValue('newPlan', annualPlan)}
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
}

export default TotalBanner
