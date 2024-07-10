import { fromUnixTime } from 'date-fns'
import { format, utcToZonedTime } from 'date-fns-tz'
import PropType from 'prop-types'
import { z } from 'zod'

import { invoicePropType, InvoiceSchema } from 'services/account'

interface InvoiceOverviewProps {
  isPaid: boolean
  invoice: z.infer<typeof InvoiceSchema>
  dueDate: number | null
}

const InvoiceOverview = ({
  isPaid,
  invoice,
  dueDate,
}: InvoiceOverviewProps) => {
  const card = invoice.defaultPaymentMethod?.card
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-gray-800">
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
              {dueDate &&
                format(
                  utcToZonedTime(fromUnixTime(dueDate), 'UTC'),
                  'MMMM do, yyyy',
                  { timeZone: 'UTC' }
                )}
            </td>
          </tr>
          {card && (
            <tr>
              <td className="pr-2">Payment method</td>
              <td>Ending in: {`${card.last4}`}</td>
              <td>
                Expiring on:
                {` ${card.expMonth}/${card.expYear}`}
              </td>
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
