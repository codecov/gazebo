import PropType from 'prop-types'

export const invoicePropType = PropType.shape({
  created: PropType.number.isRequired,
  dueDate: PropType.number,
  total: PropType.number.isRequired,
  invoicePdf: PropType.string.isRequired,
})

export const planPropType = PropType.shape({
  marketingName: PropType.string.isRequired,
  baseUnitPrice: PropType.number.isRequired,
  benefits: PropType.arrayOf(PropType.string).isRequired,
  quantity: PropType.number,
  value: PropType.string.isRequired,
  monthlyUploadLimit: PropType.number,
})

export const subscriptionDetailType = PropType.shape({
  latestInvoice: invoicePropType,
  defaultPaymentMethod: PropType.shape({
    card: PropType.shape({
      brand: PropType.string,
      expMonth: PropType.number,
      expYear: PropType.number,
      last4: PropType.string,
    }),
    usBankAccount: PropType.shape({
      bankName: PropType.string,
      last4: PropType.string,
    }),
  }),
  trialEnd: PropType.number,
})

export const accountDetailsPropType = PropType.shape({
  plan: planPropType,
  activatedUserCount: PropType.number.isRequired,
  planAutoActivate: PropType.bool,
  subscriptionDetail: subscriptionDetailType,
})
