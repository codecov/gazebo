import PropTypes from 'prop-types'

import { formatNumberToUSD, Plans } from 'shared/utils/billing'
import Icon from 'ui/Icon'

interface TotalBannerProps {
  isPerYear: boolean
  perYearPrice: number
  perMonthPrice: number
  setValue: (x: string, y: string) => void
}

const TotalBanner: React.FC<TotalBannerProps> = ({
  isPerYear,
  perYearPrice,
  perMonthPrice,
  setValue,
}) => {
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
}

export default TotalBanner
