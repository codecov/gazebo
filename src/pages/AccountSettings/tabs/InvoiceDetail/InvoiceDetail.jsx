import cs from 'classnames'
import PropTypes from 'prop-types'
import qs from 'qs'
import { useEffect } from 'react'
import { useLocation, useParams } from 'react-router-dom'

import { useAccountDetails, useInvoice } from 'services/account'
import { useNavLinks } from 'services/navigation'
import A from 'ui/A'
import Icon from 'ui/Icon'

import InvoiceFooter from './sections/InvoiceFooter'
import InvoiceHeader from './sections/InvoiceHeader'
import InvoiceItems from './sections/InvoiceItems'
import InvoiceSubTotal from './sections/InvoiceSubTotal'

import BackLink from '../../shared/BackLink'

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

function InvoiceDetail({ provider, owner }) {
  const { id } = useParams()
  const { data: accountDetails } = useAccountDetails({ provider, owner })
  const { data: invoice } = useInvoice({ provider, owner, id })
  const { invoiceTab, invoiceDetail } = useNavLinks()

  usePrintPage()

  return (
    <>
      <div className="mb-8">
        <BackLink
          to={invoiceTab.path()}
          useRouter={!invoiceTab.isExternalLink}
          textLink={invoiceTab.text}
        />
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
      <div className="my-8 flex gap-5">
        {/* TODO: add the download button here */}
        <A
          href={invoiceDetail.path({ id: invoice.id }) + '?print'}
          variant="semibold"
        >
          <Icon name="printer" variant="solid" size="sm" />
          Print
        </A>
      </div>
    </>
  )
}

InvoiceDetail.propTypes = {
  provider: PropTypes.string.isRequired,
  owner: PropTypes.string.isRequired,
}

export default InvoiceDetail
