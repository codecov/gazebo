import { z } from 'zod'

import amexLogo from 'assets/billing/amex.svg'
import discoverLogo from 'assets/billing/discover.svg'
import mastercardLogo from 'assets/billing/mastercard.svg'
import visaLogo from 'assets/billing/visa.svg'
import { SubscriptionDetailSchema } from 'services/account'
import {
  formatTimestampToCalendarDate,
  lastTwoDigits,
} from 'shared/utils/billing'

const cardBrands = {
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

type CardBrand = keyof typeof cardBrands

interface CardInformationProps {
  subscriptionDetail: z.infer<typeof SubscriptionDetailSchema>
  card: {
    brand: string
    last4: string
    expMonth: number
    expYear: number
  }
}
function CardInformation({ subscriptionDetail, card }: CardInformationProps) {
  const typeCard = cardBrands[card?.brand as CardBrand] ?? cardBrands.fallback
  let nextBilling = null

  if (!subscriptionDetail?.cancelAtPeriodEnd) {
    nextBilling = formatTimestampToCalendarDate(
      subscriptionDetail?.currentPeriodEnd
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-1">
        <img
          className="h-auto w-8 self-center"
          alt="credit card logo"
          src={typeCard?.logo}
        />
        <div className="flex flex-col self-center">
          <b>••••&nbsp;{card?.last4}</b>
        </div>
      </div>
      <p className="text-ds-gray-quinary">
        Expires {card?.expMonth}/{lastTwoDigits(card?.expYear)}
      </p>
      {nextBilling && (
        <p className="text-ds-gray-quinary">
          Your next billing date is{' '}
          <span className="text-ds-gray-octonary">{nextBilling}</span>.
        </p>
      )}
    </div>
  )
}

export default CardInformation
