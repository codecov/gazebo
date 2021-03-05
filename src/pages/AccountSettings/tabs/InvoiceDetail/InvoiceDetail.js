import qs from 'qs'
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import PropTypes from 'prop-types'
import { useParams, Link } from 'react-router-dom'
import cs from 'classnames'

import { useInvoice, useAccountDetails } from 'services/account'
import { useNavLinks } from 'services/navigation'
import Button from 'ui/Button'

import BackLink from '../../shared/BackLink'
import InvoiceHeader from './sections/InvoiceHeader'
import InvoiceItems from './sections/InvoiceItems'
import InvoiceFooter from './sections/InvoiceFooter'
import InvoiceSubTotal from './sections/InvoiceSubTotal'

const classNameSection =
  'py-8 px-16 border-t first:border-0 border-gray-200 print:px-0'
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

function InvoiceDetail({ provider, owner }) {
  const { id } = useParams()
  const { data: accountDetails } = useAccountDetails({ provider, owner })
  const { data: invoice } = useInvoice({ provider, owner, id })
  const { invoiceTab } = useNavLinks()

  usePrintPage()

  return (
    <>
      <div className="mb-8">
        <BackLink to={invoiceTab.path()} textLink="Invoice overview" />
      </div>
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
      <div className="my-8">
        <Button to={invoiceTab.path()} Component={Link} variant="outline">
          Back to invoices
        </Button>
        <Button className="ml-4" onClick={window.print}>
          Print
        </Button>
      </div>
    </>
  )
}

InvoiceDetail.propTypes = {
  provider: PropTypes.string.isRequired,
  owner: PropTypes.string.isRequired,
}

export default InvoiceDetail
