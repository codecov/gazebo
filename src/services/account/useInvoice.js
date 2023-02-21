import { useQuery } from '@tanstack/react-query'

import Api from 'shared/api'

export function useInvoice({ provider, owner, id }) {
  return useQuery({
    queryKey: ['invoice', provider, owner, id],
    queryFn: ({ signal }) => {
      const path = `/${provider}/${owner}/invoices/${id}`
      return Api.get({ path, provider, signal })
    },
  })
}
