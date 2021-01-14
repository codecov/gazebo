import PropTypes from 'prop-types'
import { useParams, Link } from 'react-router-dom'

import { useInvoice, useAccountDetails } from 'services/account'
import Button from 'ui/Button'

import BackLink from '../../shared/BackLink'
import InvoiceHeader from './sections/InvoiceHeader'
import InvoiceItems from './sections/InvoiceItems'
import InvoiceFooter from './sections/InvoiceFooter'
import InvoiceSubTotal from './sections/InvoiceSubTotal'

function InvoiceDetail({ provider, owner }) {
  const { id } = useParams()
  const { data: accountDetails } = useAccountDetails({ provider, owner })
  const { data: invoice } = useInvoice({ provider, owner, id })
  const classNameSection = 'py-8 px-16 border-t first:border-0 border-gray-200'
  const backLinkUrl = `/account/${provider}/${owner}/invoices`

  return (
    <>
      <BackLink to={backLinkUrl} textLink="Invoice overview" />
      <div className="bg-white shadow-card border-pink-500 border-t-2 mt-8">
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
        <Button to={backLinkUrl} Component={Link} variant="outline">
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
