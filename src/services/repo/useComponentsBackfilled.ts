import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { z } from 'zod'

import Api from 'shared/api'

const query = `
  query BackfillComponentMemberships($name: String!, $repo: String!) {
    config {
      isTimescaleEnabled
    }
    owner(username:$name){
      repository: repositoryDeprecated(name:$repo){
        componentsMeasurementsActive
        componentsMeasurementsBackfilled
        componentsCount
      }
    }
  }
`

const BackfillComponentsMembershipSchema = z.object({
  config: z
    .object({
      isTimescaleEnabled: z.boolean().nullish(),
    })
    .nullish(),
  owner: z.object({
    repository: z.object({
      componentsMeasurementsActive: z.boolean().nullish(),
      componentsMeasurementsBackfilled: z.boolean().nullish(),
      componentsCount: z.number().nullish(),
    }),
  }),
})

interface URLParams {
  provider: string
  owner: string
  repo: string
}

export function useComponentsBackfilled() {
  const { provider, owner, repo } = useParams<URLParams>()
  return useQuery({
    queryKey: ['BackfillComponentMemberships', provider, owner, repo],
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
        const parsedData = BackfillComponentsMembershipSchema.safeParse(
          res?.data
        )

        if (!parsedData.success) {
          return Promise.reject({
            status: 404,
            data: {},
            dev: 'useComponentsBackfilled - 404 Not Found Error',
          })
        }

        return {
          ...parsedData.data?.config,
          ...parsedData.data?.owner?.repository,
        }
      }),
  })
}
