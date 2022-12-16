import PropTypes from 'prop-types'

function InvoiceItems({ invoice }) {
  return (
    <div className="flex flex-col gap-4">
      <h4 className="text-lg bold">Description</h4>
      <table className="w-full text-left">
        <tr className="border-b-2 border-black b-y-4">
          <th>Description</th>
          <th>Amount</th>
        </tr>
        {invoice.lineItems.map((line, i) => (
          <tr key={i}>
            <td className="p-2">{line.description}</td>
            <td>{(line.amount / 100).toFixed(2)}</td>
          </tr>
        ))}
      </table>
    </div>
  )
}

InvoiceItems.propTypes = {
  invoice: PropTypes.shape({
    lineItems: PropTypes.arrayOf(
      PropTypes.shape({
        quantity: PropTypes.number.isRequired,
        amount: PropTypes.number.isRequired,
        description: PropTypes.string,
        planName: PropTypes.string,
        period: PropTypes.shape({
          start: PropTypes.number,
          end: PropTypes.number,
        }).isRequired,
      })
    ).isRequired,
  }).isRequired,
}

export default InvoiceItems
