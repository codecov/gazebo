import { format, fromUnixTime } from 'date-fns'

import AppLink from 'old_ui/AppLink'
import Card from 'old_ui/Card'
import { invoicePropType } from 'services/account'
import { useNavLinks } from 'services/navigation'
import A from 'ui/A'
import Icon from 'ui/Icon'

import invoiceImg from './invoice.svg'

function LatestInvoiceCard({ invoice }) {
  const { invoiceDetail } = useNavLinks()
  if (!invoice || !invoice.dueDate || !invoice.created) return null
  return (
    <Card className="p-6 mb-4">
      <h2 className="text-lg mb-4">Invoices</h2>
      <div className="mb-5 flex items-center">
        <img src={invoiceImg} alt="invoice icon" />
        <div className="ml-4">
          <div className="text-gray-500 mr-1">
            {format(fromUnixTime(invoice?.created), 'MMMM yyyy')}
          </div>
          <div className="italic text-gray-400">
            Due date {format(fromUnixTime(invoice.dueDate), 'do MMM')} - $
            {(invoice.total / 100).toFixed(2)}
            <AppLink
              className="inline-block not-italic underline hover:underline text-blue-200 ml-2"
              to={invoiceDetail.path({ id: invoice.id })}
              useRouter={!invoiceDetail.isExternalLink}
            >
              View
            </AppLink>
          </div>
        </div>
      </div>
      <A to={{ pageName: 'invoiceTab' }} variant="semibold">
        See all invoices <Icon name="chevronRight" size="sm" variant="solid" />
      </A>
    </Card>
  )
}

LatestInvoiceCard.propTypes = {
  invoice: invoicePropType,
}

export default LatestInvoiceCard
