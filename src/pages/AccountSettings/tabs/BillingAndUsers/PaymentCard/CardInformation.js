import { format, fromUnixTime } from 'date-fns'
import PropTypes from 'prop-types'

import { subscriptionDetailType } from 'services'
import A from 'ui/A'
import Icon from 'ui/Icon'

import amexLogo from './assets/amex.png'
import discoverLogo from './assets/discover.jpg'
import mastercardLogo from './assets/mastercard.png'
import visaLogo from './assets/visa.png'

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

function getNextBilling(subscriptionDetail) {
  const isCancelled = subscriptionDetail.cancelAtPeriodEnd

  if (isCancelled) return null

  const periodEnd = fromUnixTime(subscriptionDetail.currentPeriodEnd)
  return format(periodEnd, 'do MMMM, yyyy')
}

function CardInformation({ subscriptionDetail, openForm, card }) {
  const typeCard = cardBrand[card?.brand] ?? cardBrand?.fallback
  const nextBilling = getNextBilling(subscriptionDetail)

  return (
    <div className="flex flex-col gap-5">
      <div className="flex gap-4">
        <img
          className="w-16 h-auto self-center"
          alt="credit card logo"
          src={typeCard?.logo}
        />
        <div className="flex flex-col self-center">
          <b className="tracking-widest">
            ****&nbsp;&nbsp;****&nbsp;&nbsp;****&nbsp;&nbsp;{card?.last4}
          </b>
          <p className="text-ds-gray-quinary">
            {typeCard?.name} - Expires {card?.expMonth}/{card?.expYear}
          </p>
        </div>
      </div>
      {nextBilling && (
        <p className="text-ds-gray-quinary text-sm">
          Next billing on{' '}
          <span className="text-ds-gray-octonary">{nextBilling}</span>.
        </p>
      )}
      <div className="flex self-start">
        <A variant="semibold" onClick={openForm} hook="edit-card">
          Edit card <Icon name="chevronRight" size="sm" variant="solid" />
        </A>
      </div>
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
  openForm: PropTypes.func.isRequired,
}

export default CardInformation
