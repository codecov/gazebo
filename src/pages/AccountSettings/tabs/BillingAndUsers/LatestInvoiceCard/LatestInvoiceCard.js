import { format, fromUnixTime } from 'date-fns'
import { Link } from 'react-router-dom'

import Button from 'ui/Button'
import Card from 'ui/Card'
import { invoicePropType } from 'services/account'
import { useBaseUrl } from 'shared/router'

import invoiceImg from './invoice.svg'

function LatestInvoiceCard({ invoice }) {
  const baseUrl = useBaseUrl()

  if (!invoice) return null
  return (
    <Card className="p-6 mt-4">
      <h2 className="text-lg mb-4">Invoices</h2>
      <div className="mb-5 flex items-center">
        <img src={invoiceImg} alt="invoice icon" />
        <div className="ml-4">
          <div className="text-gray-500 mr-1">
            {format(fromUnixTime(invoice.created), 'MMMM yyyy')}
          </div>
          <div className="italic text-gray-400">
            Due date {format(fromUnixTime(invoice.dueDate), 'do MMM')} - $
            {(invoice.total / 100).toFixed(2)}
            <a
              className="inline-block not-italic underline hover:underline text-blue-200 ml-2"
              href={invoice.invoicePdf}
              rel="noreferrer"
              target="_blank"
            >
              View
            </a>
          </div>
        </div>
      </div>
      <Button
        color="pink"
        variant="outline"
        to={`${baseUrl}invoices`}
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
