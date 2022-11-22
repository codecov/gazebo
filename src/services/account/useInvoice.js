import { useQuery } from '@tanstack/react-query'

import Api from 'shared/api'

export function useInvoice({ provider, owner, id }) {
  return useQuery(['invoice', provider, owner, id], ({ signal }) => {
    const path = `/${provider}/${owner}/invoices/${id}`
    return Api.get({ path, provider, signal })
  })
}
