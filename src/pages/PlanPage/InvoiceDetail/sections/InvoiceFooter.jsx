import { invoicePropType } from 'services/account'

function InvoiceFooter({ invoice }) {
  const discount = invoice.amountDue - invoice.subtotal

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-end">
        <table className="text-lg w-1/5">
          <tr>
            <td>Subtotal</td>
            <td>${(invoice.subtotal / 100).toFixed(2)}</td>
          </tr>
          {discount > 0 && (
            <tr>
              <td>Dicsount</td>
              <td>$-{(discount / 100).toFixed(2)}</td>
            </tr>
          )}
          <tr>
            <td>Total</td>
            <td>${(invoice.total / 100).toFixed(2)}</td>
          </tr>
          <tr>
            <td>Amount paid</td>
            <td> ${(invoice.amountPaid / 100).toFixed(2)}</td>
          </tr>
        </table>
      </div>
      <footer>{invoice.footer}</footer>
    </div>
  )
}

InvoiceFooter.propTypes = {
  invoice: invoicePropType,
}

export default InvoiceFooter
