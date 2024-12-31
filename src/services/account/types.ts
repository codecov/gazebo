import amexLogo from 'assets/billing/amex.svg'
import discoverLogo from 'assets/billing/discover.svg'
import mastercardLogo from 'assets/billing/mastercard.svg'
import visaLogo from 'assets/billing/visa.svg'

export interface Invoice {
  created: number
  dueDate?: number
  total: number
  invoicePdf: string
}

export interface Plan {
  marketingName: string
  baseUnitPrice: number
  benefits: string[]
  quantity?: number
  value: string
  monthlyUploadLimit?: number
}

export interface Card {
  brand: CardBrand
  expMonth: number
  expYear: number
  last4: string
}

export interface PaymentMethod {
  card: Card
}

export interface SubscriptionDetail {
  latestInvoice?: Invoice
  defaultPaymentMethod?: PaymentMethod
  trialEnd?: number
  cancelAtPeriodEnd?: boolean
  currentPeriodEnd?: number
}

export interface AccountDetails {
  plan: Plan
  activatedUserCount: number
  planAutoActivate?: boolean
  subscriptionDetail?: SubscriptionDetail
}

export const CardBrands = {
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

export type CardBrand = keyof typeof CardBrands
