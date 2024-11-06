import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'

import Api from 'shared/api'

export const HasAdminsSchema = z.object({
  config: z
    .object({
      hasAdmins: z.boolean().nullable(),
    })
    .nullable(),
})

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
    select: ({ data }: { data: z.infer<typeof HasAdminsSchema> }) =>
      data?.config?.hasAdmins,
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
