import { fromUnixTime } from 'date-fns'
import { format, utcToZonedTime } from 'date-fns-tz'
import PropType from 'prop-types'

import { invoicePropType } from 'services/account'

const InvoiceOverview = ({ isPaid, invoice, dueDate }) => {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl text-gray-800 font-semibold">
        {isPaid ? 'Receipt' : 'Invoice'}
      </h1>
      <table>
        <tbody>
          <tr>
            <td className="pr-2"> {isPaid ? 'Receipt' : 'Invoice'} number</td>
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
                utcToZonedTime(fromUnixTime(dueDate), 'UTC'),
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
  )
}

InvoiceOverview.propTypes = {
  invoice: invoicePropType,
  isPaid: PropType.bool.isRequired,
  dueDate: PropType.number.isRequired,
}

export default InvoiceOverview
