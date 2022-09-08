import { fromUnixTime, getYear } from 'date-fns'
import groupBy from 'lodash/groupBy'
import PropTypes from 'prop-types'
import { useMemo } from 'react'

import { useInvoices } from 'services'
import { useNavLinks } from 'services/navigation'

import InvoiceCard from './InvoiceCard'

import BackLink from '../../shared/BackLink'

function useGroupedInvoices({ owner, provider }) {
  const { data: invoices } = useInvoices({ provider, owner })

  // group the invoices per year, so we can iterate per year
  // then per invoice in each year
  const groupedInvoices = useMemo(() => {
    return groupBy(invoices, (invoice) =>
      getYear(fromUnixTime(invoice.created))
    )
  }, [invoices])

  return groupedInvoices
}

function Invoices({ provider, owner }) {
  const groupedInvoices = useGroupedInvoices({ provider, owner })
  const { billingAndUsers } = useNavLinks()
  // extract the years so we can be sure of the desc order of the years
  const years = Object.keys(groupedInvoices).sort().reverse()

  return (
    <>
      <BackLink
        to={billingAndUsers.path()}
        useRouter={!billingAndUsers.isExternalLink}
        textLink={billingAndUsers.text}
      />
      {years.map((year) => (
        <div className="mt-8 lg:w-3/4" key={year}>
          <h2 className="text-center text-xl bold">{year}</h2>
          {groupedInvoices[year].map((invoice) => (
            <InvoiceCard
              key={invoice.number}
              invoice={invoice}
              provider={provider}
              owner={owner}
            />
          ))}
        </div>
      ))}
    </>
  )
}

Invoices.propTypes = {
  provider: PropTypes.string.isRequired,
  owner: PropTypes.string.isRequired,
}

export default Invoices
