import PropTypes from 'prop-types'

function InvoiceItems({ invoice }) {
  return (
    <table className="w-full text-left text-base font-normal">
      <thead>
        <tr className="border-b-2 border-black">
          <th>Description</th>
          <th className="text-right">Amount</th>
        </tr>
      </thead>
      <tbody>
        {invoice.lineItems.map((line, i) => (
          <tr key={i}>
            <td className="p-2">{line.description}</td>
            <td className=" text-right">${(line.amount / 100).toFixed(2)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

InvoiceItems.propTypes = {
  invoice: PropTypes.shape({
    lineItems: PropTypes.arrayOf(
      PropTypes.shape({
        quantity: PropTypes.number.isRequired,
        amount: PropTypes.number.isRequired,
        description: PropTypes.string,
        value: PropTypes.string,
        period: PropTypes.shape({
          start: PropTypes.number,
          end: PropTypes.number,
        }).isRequired,
      })
    ).isRequired,
  }).isRequired,
}

export default InvoiceItems
