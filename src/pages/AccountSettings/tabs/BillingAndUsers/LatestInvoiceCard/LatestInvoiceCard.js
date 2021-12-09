import { format, fromUnixTime } from 'date-fns'
import { Link } from 'react-router-dom'

import Button from 'old_ui/Button'
import Card from 'old_ui/Card'
import AppLink from 'old_ui/AppLink'
import { invoicePropType } from 'services/account'
import { useNavLinks } from 'services/navigation'

import invoiceImg from './invoice.svg'

console.log('test test')
function LatestInvoiceCard({ invoice }) {
  const { invoiceDetail, invoiceTab } = useNavLinks()
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
      <Button
        color="pink"
        variant="outline"
        to={invoiceTab.path()}
        useRouter={!invoiceTab.isExternalLink}
        Component={Link}
      >
        See all invoices
      </Button>
    </Card>
  )
}

LatestInvoiceCard.propTypes = {
  invoice: invoicePropType,
}

export default LatestInvoiceCard
