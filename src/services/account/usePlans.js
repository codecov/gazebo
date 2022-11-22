import { useQuery } from '@tanstack/react-query'

import Api from 'shared/api'

function fetchPlan({ provider, signal }) {
  const path = `/plans`
  return Api.get({ path, provider, signal })
}

export function usePlans(provider) {
  // the plans are very static data
  return useQuery(['plans'], ({ signal }) => fetchPlan({ provider, signal }), {
    // I dunno here if staleTime should be infinity. Plans do change every now and then :surprised-face:
    cacheTime: Infinity,
    staleTime: Infinity,
  })
}
