import cs from 'classnames'
import { format, fromUnixTime } from 'date-fns'

import Card from 'old_ui/Card'
import { invoicePropType } from 'services/account'
import { useNavLinks } from 'services/navigation'
import A from 'ui/A'
import Icon from 'ui/Icon'

//Fix to use our color scheme
const statusToColor = {
  draft: 'text-gray-500',
  open: 'text-blue-400',
  paid: 'text-success-700',
  void: 'text-gray-900',
  uncollectible: 'text-error-500',
}

function InvoiceCard({ invoice }) {
  const { invoiceDetailsPage } = useNavLinks()

  return (
    <Card
      variant="old"
      className="mt-4 flex items-center justify-between px-4 py-6 text-sm"
    >
      <div>
        Invoice on {format(fromUnixTime(invoice.created), 'MMMM do yyyy')}
      </div>
      <div className="flex gap-4">
        <span className={cs('ml-auto text-sm', statusToColor[invoice.status])}>
          ${(invoice.total / 100).toFixed(2)}{' '}
          <span className="capitalize">{invoice.status}</span>
        </span>
        <A
          href={invoiceDetailsPage.path({ id: invoice.id }) + '?print'}
          variant="semibold"
          hook="download-invoice"
        >
          <Icon name="download" variant="solid" size="sm" />
          Download
        </A>
        <span>|</span>
        <A
          to={{
            pageName: 'invoiceDetailsPage',
            options: {
              id: invoice.id,
            },
          }}
          variant="semibold"
        >
          View <Icon name="chevronRight" size="sm" variant="solid" />
        </A>
      </div>
    </Card>
  )
}

InvoiceCard.propTypes = {
  invoice: invoicePropType.isRequired,
}

export default InvoiceCard
