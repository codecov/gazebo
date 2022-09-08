import { format, fromUnixTime } from 'date-fns'

import { invoicePropType } from 'services'
import A from 'ui/A'
import Card from 'ui/Card'
import Icon from 'ui/Icon'

import invoiceImg from './invoice.svg'

function LatestInvoiceCard({ invoice }) {
  if (!invoice || !invoice?.dueDate || !invoice?.created) return null
  return (
    <Card header="Invoices">
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-4">
          <img src={invoiceImg} alt="invoice icon" />
          <div className="flex flex-col">
            <div className="text-ds-gray-quinary">
              {format(fromUnixTime(invoice?.created), 'MMMM yyyy')}
            </div>
            <div className="text-ds-gray-quaternary">
              <span className="italic">
                Due date {format(fromUnixTime(invoice?.dueDate), 'do MMM')} - $
                {(invoice?.total / 100).toFixed(2)}{' '}
              </span>
              <A
                to={{ pageName: 'invoiceDetail', options: { id: invoice?.id } }}
                isExternal={false}
              >
                View
              </A>
            </div>
          </div>
        </div>
        <div className="flex self-start">
          <A to={{ pageName: 'invoiceTab' }} variant="semibold">
            See all invoices{' '}
            <Icon name="chevronRight" size="sm" variant="solid" />
          </A>
        </div>
      </div>
    </Card>
  )
}

LatestInvoiceCard.propTypes = {
  invoice: invoicePropType,
}

export default LatestInvoiceCard
