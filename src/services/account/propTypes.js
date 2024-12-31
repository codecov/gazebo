import PropType from 'prop-types'

// TODO: These types were duplicated into types.ts, 
// delete this file once all usages are migrated to TS

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
      brand: PropType.string.isRequired,
      expMonth: PropType.number.isRequired,
      expYear: PropType.number.isRequired,
      last4: PropType.string.isRequired,
    }).isRequired,
  }),
  trialEnd: PropType.number,
})

export const accountDetailsPropType = PropType.shape({
  plan: planPropType,
  activatedUserCount: PropType.number.isRequired,
  planAutoActivate: PropType.bool,
  subscriptionDetail: subscriptionDetailType,
})
