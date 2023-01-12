import { fromUnixTime } from 'date-fns'
import { format, utcToZonedTime } from 'date-fns-tz'

import { accountDetailsPropType, invoicePropType } from 'services/account'

import { generateAddressInfo } from './generateAddressInfo'

function InvoiceHeader({ invoice, accountDetails }) {
  const addressInfo = generateAddressInfo(accountDetails)
  const isPaid = invoice.status === 'paid'

  return (
    <div className="flex flex-col gap-6 text-lg">
      <div className="flex justify-between">
        <div className="flex flex-col gap-6">
          <h1 className="text-xl text-gray-800 font-semibold">
            {isPaid ? 'Receipt' : 'Invoice'}
          </h1>
          <table>
            <tbody>
              <tr>
                <td className="pr-2">
                  {' '}
                  {isPaid ? 'Receipt' : 'Invoice'} number
                </td>
                <td>{invoice.number}</td>
              </tr>
              <tr>
                <td className="pr-2">Date of issue</td>
                <td>
                  {format(
                    utcToZonedTime(fromUnixTime(invoice.created), 'UTC'),
                    'MMMM do, yyyy',
                    { timeZone: 'UTC' }
                  )}
                </td>
              </tr>
              <tr>
                <td className="pr-2">Date due</td>
                <td>
                  {format(
                    utcToZonedTime(fromUnixTime(invoice.dueDate), 'UTC'),
                    'MMMM do, yyyy',
                    { timeZone: 'UTC' }
                  )}
                </td>
              </tr>
              {invoice.defaultPaymentMethod && (
                <tr>
                  <td className="pr-2">Payment method</td>
                  <td>{invoice.defaultPaymentMethod}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div>
          <img
            alt="Codecov Logo"
            src={`${process.env.PUBLIC_URL}/logo.png`}
            width={200}
          />
        </div>
      </div>
      <div className="flex gap-64">
        <div>
          <p className="font-semibold">Codecov</p>
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
        <div>
          <p className="font-semibold">Bill to</p>
          <p>{invoice.customerName}</p>
          <address className="not-italic text-gray-800">
            {addressInfo.map((addressItem, i) => (
              <span key={`${addressItem}-${i}`}>
                {addressItem}
                <br />
              </span>
            ))}
          </address>
          <p>{invoice.customerEmail}</p>
        </div>
      </div>
      <p className="font-semibold">
        ${(invoice.total / 100).toFixed(2)} {isPaid ? 'paid on' : 'due'}{' '}
        {format(fromUnixTime(invoice?.dueDate), 'MMMM do yyyy')}
      </p>
    </div>
  )
}

InvoiceHeader.propTypes = {
  invoice: invoicePropType,
  accountDetails: accountDetailsPropType.isRequired,
}

export default InvoiceHeader
