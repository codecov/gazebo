import { format, fromUnixTime } from 'date-fns'
import { Link } from 'react-router-dom'

import Card from 'ui/Card'
import { invoicePropType } from 'services/account'

import invoiceImg from './invoice.svg'

function LatestInvoiceCard({ invoice }) {
  return (
    <Card className="p-6">
      <h2 className="text-lg mb-4">Invoices</h2>
      {invoice ? (
        <>
          <div className="mb-5 flex items-center">
            <img src={invoiceImg} alt="invoice icon" />
            <div className="ml-4">
              <div className="text-gray-500 mr-1">
                {format(fromUnixTime(invoice.periodStart), 'MMMM yyyy')}
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
          <Link
            to="#"
            className="inline-block border text-pink-500 border-pink-500 hover:text-pink-900 hover:border-pink-900 py-2 px-4 rounded-full"
          >
            See all invoices
          </Link>
        </>
      ) : (
        <p className="text-gray-500 italic">No invoices yet</p>
      )}
    </Card>
  )
}

LatestInvoiceCard.propTypes = {
  invoice: invoicePropType,
}

export default LatestInvoiceCard
