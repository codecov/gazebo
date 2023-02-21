import { useQuery } from '@tanstack/react-query'

import Api from 'shared/api'

export function useInvoices({ provider, owner }) {
  return useQuery({
    queryKey: ['invoices', provider, owner],
    queryFn: ({ signal }) => {
      const path = `/${provider}/${owner}/invoices/`
      return Api.get({ path, provider, signal })
    },
  })
}
