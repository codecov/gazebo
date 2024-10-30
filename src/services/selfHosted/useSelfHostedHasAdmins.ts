import { useQuery } from '@tanstack/react-query'

import Api from 'shared/api'

function fetchHasAdmins({ provider }: { provider: string }) {
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

export const useSelfHostedHasAdmins = (
  { provider }: { provider: string },
  options = {}
) => {
  const opts = {
    select: ({ data }) => data?.config?.hasAdmins,
    keepPreviousData: true,
    ...options,
  }

  return useQuery({
    queryKey: ['hasAdmins', provider],
    queryFn: () =>
      fetchHasAdmins({
        provider,
      }),
    ...opts,
  })
}
