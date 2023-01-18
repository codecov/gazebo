export function generateAddressInfo(accountDetails) {
  const billingDetails =
    accountDetails.subscriptionDetail?.defaultPaymentMethod?.billingDetails

  if (!billingDetails) return []

  // merge all the billingDetails without empty value in a the following:
  // ['Donald Duck',
  // '180 Broadway',
  // 'Floor 2',
  // 'Boulder CO 10789 USA']

  const { name, address } = billingDetails
  const addressInfo = [
    name,
    address.line1,
    address.line2,
    [address.city, address.state, address.postalCode, address.country]
      .filter(Boolean)
      .join(' '),
  ].filter(Boolean)

  return addressInfo
}
