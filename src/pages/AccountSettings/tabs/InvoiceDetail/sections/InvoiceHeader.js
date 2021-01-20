import { format, fromUnixTime } from 'date-fns'

import { invoicePropType } from 'services/account'

function InvoiceHeader({ invoice }) {
  return (
    <div className="flex justify-between">
      <div className="text-sm">
        <img
          alt="Codecov Logo"
          src={`${process.env.PUBLIC_URL}/logo.png`}
          width={200}
        />
        <h4 className="bold text-pink-500 mt-8">FROM</h4>
        <address className="not-italic text-gray-800">
          Codecov LLC
          <br />
          9450 SW Gemini Drive
          <br />
          #32076
          <br />
          Beaverton, OR 97008-7105
          <br />
          United States
        </address>
      </div>
      <div className="text-right">
        <h1 className="text-xl text-gray-800">INVOICE</h1>
        <p className="text-sm text-gray-400">
          {format(fromUnixTime(invoice.created), 'MMMM do, yyyy')}
          <br />
          {invoice.currency.toUpperCase()}
          <br />#{invoice.number}
        </p>
      </div>
    </div>
  )
}

InvoiceHeader.propTypes = {
  invoice: invoicePropType.isRequired,
}

export default InvoiceHeader
