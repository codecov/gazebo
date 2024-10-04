import { fromUnixTime } from 'date-fns'
import { format, toZonedTime } from 'date-fns-tz'
import { z } from 'zod'

import { InvoiceSchema } from 'services/account'

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
      <h1 className="text-xl font-semibold text-ds-gray-octonary">
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
                toZonedTime(fromUnixTime(invoice.created), 'UTC'),
                'MMMM do, yyyy',
                { timeZone: 'UTC' }
              )}
            </td>
          </tr>
          <tr>
            <td className="pr-2">Date due</td>
            {dueDate ? (
              <td>
                {format(
                  toZonedTime(fromUnixTime(dueDate), 'UTC'),
                  'MMMM do, yyyy',
                  { timeZone: 'UTC' }
                )}
              </td>
            ) : null}
          </tr>
          {card ? (
            <tr>
              <td className="pr-2">Payment method</td>
              <td>Ending in: {`${card.last4}`}</td>
              <td>
                Expiring on:
                {` ${card.expMonth}/${card.expYear}`}
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  )
}

export default InvoiceOverview
