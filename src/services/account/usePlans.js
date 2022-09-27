import { useQuery } from '@tanstack/react-query'

import Api from 'shared/api'

function fetchPlan(provider) {
  const path = `/plans`
  return Api.get({ path, provider })
}

export function usePlans(provider) {
  // the plans are very static data
  return useQuery(['plans'], () => fetchPlan(provider), {
    // I dunno here if staleTime should be infinity. Plans do change every now and then :surprised-face:
    cacheTime: Infinity,
    staleTime: Infinity,
  })
}
