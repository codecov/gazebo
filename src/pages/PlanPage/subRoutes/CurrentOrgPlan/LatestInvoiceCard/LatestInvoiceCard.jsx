import { format, fromUnixTime } from 'date-fns'
import { useParams } from 'react-router-dom'

import invoiceImg from 'assets/svg/invoice.svg'
import { useInvoices } from 'services/account'
import A from 'ui/A'
import Card from 'ui/Card'
import Icon from 'ui/Icon'

function LatestInvoiceCard() {
  const { provider, owner } = useParams()
  const { data: invoices } = useInvoices({ provider, owner })
  const latestInvoice = !!invoices?.length && invoices[0]

  if (!latestInvoice || !latestInvoice?.created) return null

  return (
    <Card header="Invoices">
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-4">
          <img src={invoiceImg} alt="invoice icon" />
          <div className="flex flex-col">
            <div className="text-ds-gray-quinary">
              {format(fromUnixTime(latestInvoice?.created), 'MMMM yyyy')}
            </div>
            <div className="text-ds-gray-quaternary">
              {latestInvoice?.dueDate && (
                <span className="italic">
                  Due date{' '}
                  {format(fromUnixTime(latestInvoice?.dueDate), 'do MMM')} - $
                  {(latestInvoice?.total / 100).toFixed(2)}{' '}
                </span>
              )}
              <A
                to={{
                  pageName: 'invoiceDetail',
                  options: { id: latestInvoice?.id },
                }}
                isExternal={false}
              >
                View
              </A>
            </div>
          </div>
        </div>
        <div className="flex self-start">
          <A to={{ pageName: 'invoicesPage' }} variant="semibold">
            See all invoices{' '}
            <Icon name="chevronRight" size="sm" variant="solid" />
          </A>
        </div>
      </div>
    </Card>
  )
}

export default LatestInvoiceCard
