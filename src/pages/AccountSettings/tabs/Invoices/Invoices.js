import groupBy from 'lodash/groupBy'
import { getYear, fromUnixTime } from 'date-fns'
import { useMemo } from 'react'
import PropTypes from 'prop-types'

import { useInvoices } from 'services/account'

import BackLink from '../../shared/BackLink'
import InvoiceCard from './InvoiceCard'

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
  // extract the years so we can be sure of the desc order of the years
  const years = Object.keys(groupedInvoices).sort().reverse()

  return (
    <>
      <BackLink
        to={`/account/${provider}/${owner}`}
        textLink="Billing & Users"
      />
      {years.map((year) => (
        <div className="mt-8" key={year}>
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
