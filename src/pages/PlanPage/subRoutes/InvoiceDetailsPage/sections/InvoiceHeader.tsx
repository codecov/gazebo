import { fromUnixTime } from 'date-fns'
import { format } from 'date-fns-tz'
import { z } from 'zod'

import { AccountDetailsSchema } from 'services/account/useAccountDetails'
import { InvoiceSchema } from 'services/account/useInvoices'
import { CollectionMethods } from 'shared/utils/billing'
import LightDarkImg from 'ui/LightDarkImg'

import { generateAddressInfo } from './generateAddressInfo'
import InvoiceOverview from './InvoiceOverview'

interface InvoiceHeaderProps {
  invoice: z.infer<typeof InvoiceSchema>
  accountDetails: z.infer<typeof AccountDetailsSchema>
}

function InvoiceHeader({ invoice, accountDetails }: InvoiceHeaderProps) {
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
          <LightDarkImg
            alt="Codecov Logo"
            src="/logo.svg"
            darkSrc="/logo_dark.svg"
            width={200}
          />
        </div>
      </div>
      <div className="flex gap-64">
        <div>
          <p className="font-semibold">Codecov</p>
          <address className="not-italic text-ds-gray-octonary">
            Functional Software, dba Sentry
            <br />
            45 Fremont St. 8th Floor
            <br />
            San Francisco, CA 94105
            <br />
            United States
          </address>
          <p>support@codecov.io</p>

          <p className="mt-2 font-semibold">
            ${(invoice.total / 100).toFixed(2)} {isPaid ? 'paid on' : 'due'}{' '}
            {dueDate && format(fromUnixTime(dueDate), 'MMMM do yyyy')}
          </p>
        </div>
        <div>
          <p className="font-semibold">Bill to</p>
          <address className="not-italic text-ds-gray-octonary">
            {addressInfo.map((addressItem, i) => (
              <span key={`${addressItem}-${i}`}>
                {addressItem}
                <br />
              </span>
            ))}
          </address>
          <p>{invoice.customerEmail}</p>

          {invoice.taxIds.length > 0 ? (
            <div className="mt-2">
              <p className="font-semibold">Tax Information</p>
              {invoice.taxIds.map((val, index) => (
                <p key={index}>{val?.value}</p>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default InvoiceHeader
