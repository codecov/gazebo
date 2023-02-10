import { fromUnixTime } from 'date-fns'
import { format } from 'date-fns-tz'

import { accountDetailsPropType, invoicePropType } from 'services/account'
import { CollectionMethods } from 'shared/utils/billing'

import { generateAddressInfo } from './generateAddressInfo'
import InvoiceOverview from './InvoiceOverview'

function InvoiceHeader({ invoice, accountDetails }) {
  const addressInfo = generateAddressInfo(accountDetails)
  const isPaid = invoice.status === 'paid'

  const isInvoicedCustomer =
    accountDetails?.subscriptionDetail?.collectionMethod ===
    CollectionMethods.INVOICED_CUSTOMER_METHOD
  const dueDate = isInvoicedCustomer ? invoice.dueDate : invoice.created

  return (
    <div className="flex flex-col gap-6 text-lg">
      <div className="flex justify-between">
        <InvoiceOverview isPaid={isPaid} invoice={invoice} dueDate={dueDate} />
        <div>
          <img
            alt="Codecov Logo"
            src={`${process.env.PUBLIC_URL}/logo.png`}
            width={200}
          />
        </div>
      </div>
      <div className="flex gap-64">
        <div>
          <p className="font-semibold">Codecov</p>
          <address className="not-italic text-gray-800">
            Codecov LLC
            <br />
            9450 SW Gemini Drive
            <br />
            #32076
            <br />
            Beaverton, OR 97008-7105
            <br />
            United States
          </address>
        </div>
        <div>
          <p className="font-semibold">Bill to</p>
          <p>{invoice.customerName}</p>
          <address className="not-italic text-gray-800">
            {addressInfo.map((addressItem, i) => (
              <span key={`${addressItem}-${i}`}>
                {addressItem}
                <br />
              </span>
            ))}
          </address>
          <p>{invoice.customerEmail}</p>
        </div>
      </div>
      <p className="font-semibold">
        ${(invoice.total / 100).toFixed(2)} {isPaid ? 'paid on' : 'due'}{' '}
        {format(fromUnixTime(dueDate), 'MMMM do yyyy')}
      </p>
    </div>
  )
}

InvoiceHeader.propTypes = {
  invoice: invoicePropType,
  accountDetails: accountDetailsPropType.isRequired,
}

export default InvoiceHeader
