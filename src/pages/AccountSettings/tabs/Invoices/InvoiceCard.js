import cs from 'classnames'
import { Link } from 'react-router-dom'
import { format, fromUnixTime } from 'date-fns'

import { invoicePropType } from 'services/account'
import Card from 'ui/Card'
import Button from 'ui/Button'

const statusToColor = {
  draft: 'text-gray-500',
  open: 'text-blue-400',
  paid: 'text-success-700',
  void: 'text-gray-900',
  uncollectible: 'text-error-500',
}

function InvoiceCard({ invoice }) {
  return (
    <Card className="p-4 mt-4 flex text-sm items-center">
      Invoice on {format(fromUnixTime(invoice.created), 'MMMM do yyyy')}
      <span
        className={cs('ml-auto text-sm mr-4', statusToColor[invoice.status])}
      >
        ${(invoice.total / 100).toFixed(2)}{' '}
        <span className="capitalize">{invoice.status}</span>
      </span>
      <Button Component={Link} href="#">
        View
      </Button>
    </Card>
  )
}

InvoiceCard.propTypes = {
  invoice: invoicePropType.isRequired,
}

export default InvoiceCard
