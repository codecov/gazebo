import { invoicePropType } from 'services/account/propTypes'

function InvoiceFooter({ invoice }) {
  const discount = invoice.amountDue - invoice.subtotal

  return (
    <div className="flex flex-col gap-10 text-base">
      <div className="flex justify-end">
        <table className="w-2/5 text-lg">
          <tbody>
            <tr className="border-t-2">
              <td className="w-4/5 p-2">Subtotal</td>
              <td className="text-end">
                ${(invoice.subtotal / 100).toFixed(2)}
              </td>
            </tr>
            {discount > 0 && (
              <tr className="border-t-2">
                <td className="p-2">Discount</td>
                <td className="text-end">$-{(discount / 100).toFixed(2)}</td>
              </tr>
            )}
            <tr className="border-t-2">
              <td className="p-2">Total</td>
              <td className="text-end">${(invoice.total / 100).toFixed(2)}</td>
            </tr>
            <tr className="border-t-2">
              <td className="p-2 font-semibold">Amount paid</td>
              <td className="text-end">
                ${(invoice.amountPaid / 100).toFixed(2)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <pre className="whitespace-pre-wrap font-sans">{invoice.footer}</pre>
    </div>
  )
}

InvoiceFooter.propTypes = {
  invoice: invoicePropType,
}

export default InvoiceFooter
