import { useQuery } from '@tanstack/react-query'

import Api from 'shared/api'

function fetchPlan({ provider, signal }) {
  const path = `/plans`
  return Api.get({ path, provider, signal })
}

export function usePlans(provider) {
  // the plans are very static data
  return useQuery({
    queryKey: ['plans', provider],
    queryFn: ({ signal }) => fetchPlan({ provider, signal }),
    cacheTime: Infinity,
    staleTime: Infinity,
  })
}
