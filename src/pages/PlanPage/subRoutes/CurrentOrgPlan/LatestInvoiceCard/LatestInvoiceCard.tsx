import { format, fromUnixTime } from 'date-fns'
import { useParams } from 'react-router-dom'

import invoiceImg from 'assets/svg/invoice.svg'
import { useInvoices } from 'services/account'
import A from 'ui/A'
import Icon from 'ui/Icon'

interface URLParams {
  provider: string
  owner: string
}

function LatestInvoiceCard() {
  const { provider, owner } = useParams<URLParams>()
  const { data: invoices } = useInvoices({
    provider: provider,
    owner: owner,
  })
  const latestInvoice = !!invoices?.length && invoices[0]

  if (!latestInvoice || !latestInvoice?.created) return null

  return (
    <div className="flex flex-col border">
      <h3 className="flex justify-between p-4 font-semibold">
        Invoices
        <A
          to={{ pageName: 'invoicesPage' }}
          hook="all-invoice-page"
          variant="semibold"
          isExternal={false}
        >
          View
          <Icon name="chevronRight" size="sm" variant="solid" />
        </A>
      </h3>
      <hr />
      <div className="flex items-center gap-4 p-4">
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
              hook="invoice-detail-page"
              isExternal={false}
            >
              View
            </A>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LatestInvoiceCard
