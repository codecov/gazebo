import { fromUnixTime, getYear } from 'date-fns'
import groupBy from 'lodash/groupBy'
import PropTypes from 'prop-types'
import { useLayoutEffect, useMemo } from 'react'
import { useParams } from 'react-router-dom'

import { useInvoices } from 'services/account'

import InvoiceCard from './InvoiceCard'

import { useSetCrumbs } from '../context'

function useGroupedInvoices() {
  const { owner, provider } = useParams()
  const { data: invoices } = useInvoices({ provider, owner })
  const setCrumb = useSetCrumbs()

  useLayoutEffect(() => {
    setCrumb([
      {
        pageName: 'invoicesPage',
        text: 'All invoices',
      },
    ])
  }, [setCrumb])

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
