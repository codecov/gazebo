import { useQuery } from '@tanstack/react-query'

import Api from 'shared/api'

export function useInvoices({ provider, owner }) {
  return useQuery(['invoices', provider, owner], () => {
    const path = `/${provider}/${owner}/invoices/`
    return Api.get({ path, provider })
  })
}
