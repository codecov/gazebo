import PropTypes from 'prop-types'

function generateAddressInfo(accountDetails) {
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

function InvoiceFooter({ invoice, accountDetails }) {
  const addressInfo = generateAddressInfo(accountDetails)

  return (
    <div className="flex">
      {addressInfo.length > 0 && (
        <div className="text-sm">
          <h4 className="bold text-pink-500">TO</h4>
          <address className="not-italic text-gray-800">
            {addressInfo.map((addressItem, i) => (
              <span key={`${addressItem}-${i}`}>
                {addressItem}
                <br />
              </span>
            ))}
          </address>
        </div>
      )}
      <div className="ml-auto text-right text-xl text-gray-800">
        TOTAL
        <span className="text-2xl ml-4">
          ${(invoice.total / 100).toFixed(2)}
        </span>
      </div>
    </div>
  )
}

InvoiceFooter.propTypes = {
  invoice: PropTypes.shape({
    total: PropTypes.number.isRequired,
  }).isRequired,
  accountDetails: PropTypes.shape({
    subscriptionDetail: PropTypes.shape({
      defaultPaymentMethod: PropTypes.shape({
        billingDetails: PropTypes.shape({
          name: PropTypes.string,
          address: PropTypes.shape({
            line1: PropTypes.string,
            line2: PropTypes.string,
            postalCode: PropTypes.string,
            city: PropTypes.string,
            state: PropTypes.string,
            country: PropTypes.string,
          }),
        }),
      }),
    }),
  }).isRequired,
}

export default InvoiceFooter
