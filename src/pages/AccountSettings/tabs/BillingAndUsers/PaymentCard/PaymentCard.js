import { format, fromUnixTime } from 'date-fns'
import get from 'lodash/get'

import Card from 'ui/Card'
import Button from 'ui/Button'
import { accountDetailsPropType } from 'services/account'

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

function PaymentCard({ accountDetails }) {
  const card = get(accountDetails, 'paymentMethod.card', null)

  if (!card) return null

  const typeCard = cardBrand[card.brand] ?? cardBrand.fallback
  const periodEnd = accountDetails.latestInvoice?.periodEnd
  const nextBilling =
    periodEnd && format(fromUnixTime(periodEnd), 'do MMMM, yyyy')

  return (
    <Card className="mt-4 p-6">
      <h2 className="text-lg mb-6">Creditcard information</h2>
      <div className="flex">
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
          Billed on the first of every month.
          <br />
           Next billing on <span className="text-gray-900">{nextBilling}</span>.
        </p>
      )}
      <Button color="pink" variant="outline">
        Edit card
      </Button>
    </Card>
  )
}

PaymentCard.propTypes = {
  accountDetails: accountDetailsPropType.isRequired,
}

export default PaymentCard
