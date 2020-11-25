import PropType from 'prop-types'

export const invoicePropType = PropType.shape({
  periodStart: PropType.number.isRequired,
  dueDate: PropType.string.isRequired,
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

export const accountDetailsPropType = PropType.shape({
  plan: planPropType,
  activatedUserCount: PropType.number.isRequired,
  inactiveUserCount: PropType.number.isRequired,
  latestInvoice: invoicePropType,
})
