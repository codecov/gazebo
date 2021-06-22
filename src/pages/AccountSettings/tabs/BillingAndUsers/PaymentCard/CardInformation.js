import PropTypes from 'prop-types'
import { format, fromUnixTime } from 'date-fns'

import Button from 'old_ui/Button'
import { subscriptionDetailType } from 'services/account'

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
  const typeCard = cardBrand[card.brand] ?? cardBrand.fallback
  const nextBilling = getNextBilling(subscriptionDetail)

  return (
    <>
      <div className="flex mt-6">
        <div className="w-12 mr-6">
          <img className="w-full" alt="credit card logo" src={typeCard.logo} />
        </div>
        <div>
          <b className="tracking-widest">
            ****&nbsp;&nbsp;****&nbsp;&nbsp;****&nbsp;&nbsp;{card.last4}
          </b>
          <p className="text-gray-500">
            {typeCard.name} - Expires {card.expMonth}/{card.expYear}
          </p>
        </div>
      </div>
      {nextBilling && (
        <p className="text-gray-500 my-4 text-sm">
          Next billing on <span className="text-gray-900">{nextBilling}</span>.
        </p>
      )}
      <Button color="pink" variant="outline" onClick={openForm}>
        Edit card
      </Button>
    </>
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
