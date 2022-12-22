import { useQuery } from '@tanstack/react-query'

import Api from 'shared/api'

function fetchHasAdmins({ provider }) {
  const query = `
  query HasAdmins {
    config {
      hasAdmins
    }
  }
  `

  return Api.graphql({
    provider,
    query,
  })
}

export const useSelfHostedHasAdmins = ({ provider }, options = {}) => {
  const opts = {
    select: ({ data }) => data?.config?.hasAdmins,
    cacheTime: 1000 * 60 * 30, // This is not a value that changes so stale data is fine.
    ...options,
  }

  return useQuery(
    ['hasAdmins', provider],
    () =>
      fetchHasAdmins({
        provider,
      }),
    opts
  )
}
