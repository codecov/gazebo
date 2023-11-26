import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { z } from 'zod'

import Api from 'shared/api'

const query = `
  query PullComponentsSelector($owner: String!, $repo: String!, $pullId: Int!, $filters: ComponentsFilters) {
    owner(username: $owner) {
      repository(name: $repo) {
        __typename
        ... on Repository {
          pull(id: $pullId) {
            compareWithBase {
              ... on Comparison {
                __typename
                componentComparisons(filters: $filters) {
                  name
                }
              }
            }
          }
        }
      }
    }
  }
`

const PullComponentsSchema = z.object({
  owner: z
    .object({
      repository: z
        .object({
          __typename: z.literal('Repository'),
          pull: z
            .object({
              compareWithBase: z
                .object({
                  __typename: z.literal('Comparison'),
                  componentComparisons: z
                    .array(
                      z.object({
                        name: z.string(),
                      })
                    )
                    .nullable(),
                })
                .nullable(),
            })
            .nullable(),
        })
        .nullable(),
    })
    .nullable(),
})

interface URLParams {
  provider: string
  owner: string
  repo: string
  pullId: string
}

interface Filters {
  components?: string[]
}

export function usePullComponents(filters: Filters = {}, options = {}) {
  const { provider, owner, repo, pullId } = useParams<URLParams>()

  return useQuery({
    queryKey: [
      'PullComponentsSelector',
      provider,
      owner,
      repo,
      pullId,
      query,
      filters,
    ],
    queryFn: ({ signal }) =>
      Api.graphql({
        provider,
        query,
        signal,
        variables: {
          provider,
          owner,
          repo,
          filters,
          pullId: parseInt(pullId, 10),
        },
      }).then((res) => {
        const parsedData = PullComponentsSchema.safeParse(res?.data)

        if (!parsedData.success) {
          return Promise.reject({
            status: 404,
            data: {
              message: 'Error parsing pull components selector data',
            },
          })
        }

        const data = parsedData.data

        return {
          pull: data?.owner?.repository?.pull,
        }
      }),
    ...options,
  })
}
