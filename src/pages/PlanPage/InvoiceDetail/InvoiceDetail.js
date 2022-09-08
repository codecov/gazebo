import cs from 'classnames'
import { format, fromUnixTime } from 'date-fns'
import qs from 'qs'
import { useEffect, useLayoutEffect } from 'react'
import { useLocation, useParams } from 'react-router-dom'

import { useAccountDetails, useInvoice } from 'services'
import { useNavLinks } from 'services/navigation'
import A from 'ui/A'
import Icon from 'ui/Icon'

import InvoiceFooter from './sections/InvoiceFooter'
import InvoiceHeader from './sections/InvoiceHeader'
import InvoiceItems from './sections/InvoiceItems'
import InvoiceSubTotal from './sections/InvoiceSubTotal'

import { useSetCrumbs } from '../context'

const classNameSection =
  'py-8 px-16 border border-t-0 print:border-0 print:border-b border-gray-200 print:px-0'
// make the Invoice container full screen so only that part is printed
const printClassnames = 'print:absolute print:inset-0 print:z-50'

function usePrintPage() {
  const urlParams = qs.parse(useLocation().search, {
    ignoreQueryPrefix: true,
  })

  const shouldPrint = 'print' in urlParams

  useEffect(() => {
    if (shouldPrint) {
      // close window after printing
      window.addEventListener('afterprint', window.close)
      window.print()
    }
  }, [shouldPrint])
}

function InvoiceDetail() {
  const { provider, owner, id } = useParams()
  const { data: accountDetails } = useAccountDetails({ provider, owner })
  const { data: invoice } = useInvoice({ provider, owner, id })
  const { invoiceDetailsPage } = useNavLinks()

  const setCrumb = useSetCrumbs()

  useLayoutEffect(() => {
    setCrumb([
      {
        pageName: 'invoicesPage',
        text: 'All invoices',
      },
      {
        pageName: 'invoiceDetailsPage',
        text: `Invoice on ${format(
          fromUnixTime(invoice?.created),
          'MMMM do yyyy'
        )}`,
      },
    ])
  }, [setCrumb, id, invoice.created])

  usePrintPage()

  return (
    <>
      <div
        className={cs(
          'bg-white shadow-card border-pink-500 border-t-2',
          printClassnames
        )}
      >
        <div className={classNameSection}>
          <InvoiceHeader invoice={invoice} />
        </div>
        <div className={classNameSection}>
          <InvoiceItems invoice={invoice} />
        </div>
        <div className={classNameSection}>
          <InvoiceSubTotal invoice={invoice} />
        </div>
        <div className={classNameSection}>
          <InvoiceFooter invoice={invoice} accountDetails={accountDetails} />
        </div>
      </div>
      <div className="my-8 flex gap-5">
        <A
          href={invoiceDetailsPage.path({ id: invoice.id }) + '?print'}
          variant="semibold"
        >
          <Icon name="printer" variant="solid" size="sm" />
          Print
        </A>
      </div>
    </>
  )
}

export default InvoiceDetail
