import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { z } from 'zod'

import Api from 'shared/api'

const query = `
query BackfillFlagMemberships($name: String!, $repo: String!) {
  config {
    isTimescaleEnabled
  }
  owner(username:$name){
    repository: repositoryDeprecated(name:$repo){
      flagsMeasurementsActive
      flagsMeasurementsBackfilled
      flagsCount
    }
  }
}
`

const BackfillFlagMembershipSchema = z.object({
  config: z
    .object({
      isTimescaleEnabled: z.boolean().nullish(),
    })
    .nullish(),
  owner: z.object({
    repository: z.object({
      flagsMeasurementsActive: z.boolean().nullish(),
      flagsMeasurementsBackfilled: z.boolean().nullish(),
      flagsCount: z.number().nullish(),
    }),
  }),
})

interface URLParams {
  provider: string
  owner: string
  repo: string
}

export function useRepoBackfilled() {
  const { provider, owner, repo } = useParams<URLParams>()
  return useQuery({
    queryKey: ['BackfillFlagMemberships', provider, owner, repo],
    queryFn: ({ signal }) =>
      Api.graphql({
        provider,
        query,
        signal,
        variables: {
          name: owner,
          repo,
        },
      }).then((res) => {
        const parsedData = BackfillFlagMembershipSchema.safeParse(res?.data)

        if (!parsedData.success) {
          return Promise.reject({
            status: 404,
            data: {},
            dev: 'useRepoBackfilled - 404 Not Found Error',
          })
        }

        return {
          ...parsedData.data.config,
          ...parsedData.data?.owner?.repository,
        }
      }),
  })
}
