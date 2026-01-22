import PropTypes from 'prop-types'

import amexLogo from 'assets/billing/amex.svg'
import discoverLogo from 'assets/billing/discover.svg'
import mastercardLogo from 'assets/billing/mastercard.svg'
import visaLogo from 'assets/billing/visa.svg'
import { subscriptionDetailType } from 'services/account/propTypes'
import {
  formatTimestampToCalendarDate,
  lastTwoDigits,
} from 'shared/utils/billing'

const cardBrand = {
  amex: {
    logo: amexLogo,
    name: 'American Express',
  },
  discover: {
    logo: discoverLogo,
    name: 'Discover',
  },
  mastercard: {
    logo: mastercardLogo,
    name: 'MasterCard',
  },
  visa: {
    logo: visaLogo,
    name: 'Visa',
  },
  fallback: {
    logo: visaLogo,
    name: 'Credit card',
  },
}

function CardInformation({
  subscriptionDetail,
  card,
  nextBillPrice,
  isFreePlan,
}) {
  const typeCard = cardBrand[card?.brand] ?? cardBrand?.fallback
  let nextBilling = null

  if (!subscriptionDetail?.cancelAtPeriodEnd) {
    nextBilling = formatTimestampToCalendarDate(
      subscriptionDetail.currentPeriodEnd
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <img
          className="h-auto w-16 self-center"
          alt="credit card logo"
          src={typeCard?.logo}
        />
        <div className="flex flex-col self-center">
          <b className="tracking-widest">••••&nbsp;{card?.last4}</b>
        </div>
      </div>
      <p className="text-ds-gray-quinary">
        Expires {card?.expMonth}/{lastTwoDigits(card?.expYear)}
      </p>
      {nextBilling && !isFreePlan && (
        <p className="text-sm text-ds-gray-quinary">
          Your next billing date is{' '}
          <span className="text-ds-gray-octonary">
            {nextBilling}
            {nextBillPrice ? ` for ${nextBillPrice}` : ''}
          </span>
          .
        </p>
      )}
    </div>
  )
}

CardInformation.propTypes = {
  subscriptionDetail: subscriptionDetailType,
  card: PropTypes.shape({
    brand: PropTypes.string.isRequired,
    last4: PropTypes.string.isRequired,
    expMonth: PropTypes.number.isRequired,
    expYear: PropTypes.number.isRequired,
  }).isRequired,
  nextBillPrice: PropTypes.string,
  isFreePlan: PropTypes.bool,
}

export default CardInformation
