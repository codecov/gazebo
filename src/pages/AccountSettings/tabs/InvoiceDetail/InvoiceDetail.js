import PropTypes from 'prop-types'
import { useParams } from 'react-router-dom'

import { useInvoice } from 'services/account'

import BackLink from '../../shared/BackLink'
import InvoiceHeader from './sections/InvoiceHeader'
import InvoiceItems from './sections/InvoiceItems'
import InvoiceFooter from './sections/InvoiceFooter'
import InvoiceTotal from './sections/InvoiceTotal'

function InvoiceDetail({ provider, owner }) {
  const { id } = useParams()
  const { data: invoice } = useInvoice({ provider, owner, id })

  const classNameSection = 'p-8 border-t first:border-0 border-gray-200'

  return (
    <>
      <BackLink
        to={`/account/${provider}/${owner}/invoices`}
        textLink="Invoice overview"
      />
      <div className="bg-white shadow-card border-pink-500 border-t-2 mt-8">
        <div className={classNameSection}>
          <InvoiceHeader invoice={invoice} />
        </div>
        <div className={classNameSection}>
          <InvoiceItems invoice={invoice} />
        </div>
        <div className={classNameSection}>
          <InvoiceTotal invoice={invoice} />
        </div>
        <div className={classNameSection}>
          <InvoiceFooter invoice={invoice} />
        </div>
      </div>
    </>
  )
}

InvoiceDetail.propTypes = {
  provider: PropTypes.string.isRequired,
  owner: PropTypes.string.isRequired,
}

export default InvoiceDetail
