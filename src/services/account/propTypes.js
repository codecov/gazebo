import PropType from 'prop-types'

export const invoicePropType = PropType.shape({
  periodStart: PropType.number.isRequired,
  dueDate: PropType.number.isRequired,
  total: PropType.number.isRequired,
  invoicePdf: PropType.string.isRequired,
})

export const planPropType = PropType.shape({
  marketingName: PropType.string.isRequired,
  baseUnitPrice: PropType.number.isRequired,
  benefits: PropType.arrayOf(PropType.string).isRequired,
  quantity: PropType.number,
  value: PropType.string.isRequired,
})

export const subscriptionDetailType = PropType.shape({
  latestInvoice: invoicePropType,
  defaultPaymentMethod: PropType.shape({
    card: PropType.shape({
      brand: PropType.string.isRequired,
      expMonth: PropType.number.isRequired,
      expYear: PropType.number.isRequired,
      last4: PropType.string.isRequired,
    }).isRequired,
  }),
})

export const accountDetailsPropType = PropType.shape({
  plan: planPropType,
  activatedUserCount: PropType.number.isRequired,
  inactiveUserCount: PropType.number.isRequired,
  subscriptionDetail: subscriptionDetailType,
})
