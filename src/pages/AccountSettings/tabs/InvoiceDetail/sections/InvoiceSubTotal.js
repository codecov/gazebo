import PropTypes from 'prop-types'

function InvoiceSubTotal({ invoice }) {
  const discount = invoice.amountDue - invoice.subtotal

  return (
    <div className="text-right flex leading-8">
      <p className="ml-auto text-gray-400">
        SUB TOTAL
        {discount > 0 && (
          <>
            <br />
            DISCOUNT
          </>
        )}
      </p>
      <p className="ml-4 text-gray-800">
        ${(invoice.total / 100).toFixed(2)}
        {discount > 0 && (
          <>
            <br />
            $-{(discount / 100).toFixed(2)}
          </>
        )}
      </p>
    </div>
  )
}

InvoiceSubTotal.propTypes = {
  invoice: PropTypes.shape({
    amountDue: PropTypes.number.isRequired,
    subtotal: PropTypes.number.isRequired,
    total: PropTypes.number.isRequired,
  }).isRequired,
}

export default InvoiceSubTotal
