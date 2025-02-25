import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { z } from 'zod'

import { MeasurementInterval } from 'pages/RepoPage/shared/constants'
import { RepoNotFoundErrorSchema } from 'services/repo'
import Api from 'shared/api'
import { rejectNetworkError } from 'shared/api/rejectNetworkError'

const FlakeAggregatesSchema = z.object({
  owner: z
    .object({
      repository: z.discriminatedUnion('__typename', [
        z.object({
          __typename: z.literal('Repository'),
          testAnalytics: z
            .object({
              flakeAggregates: z
                .object({
                  flakeCount: z.number(),
                  flakeCountPercentChange: z.number().nullable(),
                  flakeRate: z.number(),
                  flakeRatePercentChange: z.number().nullable(),
                })
                .nullable(),
            })
            .nullable(),
        }),
        RepoNotFoundErrorSchema,
      ]),
    })
    .nullable(),
})

const query = `
  query GetFlakeAggregates(
    $owner: String!
    $repo: String!
    $interval: MeasurementInterval
  ) {
    owner(username: $owner) {
      repository: repository(name: $repo) {
        __typename
        ... on Repository {
            testAnalytics {
              flakeAggregates(interval: $interval) {
                flakeCount
                flakeCountPercentChange
                flakeRate
                flakeRatePercentChange
              }
          }
        }
        ... on NotFoundError {
          message
        }
      }
    }
  }
  `

interface URLParams {
  provider: string
  owner: string
  repo: string
}

interface UseFlakeAggregatesOptions {
  enabled?: boolean
  suspense?: boolean
}

interface UseFlakeAggregatesParams {
  interval?: MeasurementInterval
  opts?: UseFlakeAggregatesOptions
}

export const useFlakeAggregates = ({
  interval,
  opts,
}: UseFlakeAggregatesParams = {}) => {
  const { provider, owner, repo } = useParams<URLParams>()

  return useQuery({
    queryKey: ['GetFlakeAggregates', provider, owner, repo, interval],
    queryFn: ({ signal }) =>
      Api.graphql({
        provider,
        query,
        signal,
        variables: {
          provider,
          owner,
          repo,
          interval,
        },
      }).then((res) => {
        const callingFn = 'useFlakeAggregates'
        const parsedData = FlakeAggregatesSchema.safeParse(res?.data)

        if (!parsedData.success) {
          return rejectNetworkError({
            errorName: 'Parsing Error',
            errorDetails: { callingFn, error: parsedData.error },
          })
        }

        const data = parsedData.data

        if (data?.owner?.repository?.__typename === 'NotFoundError') {
          return rejectNetworkError({
            errorName: 'Not Found Error',
            errorDetails: { callingFn },
          })
        }

        return data.owner?.repository.testAnalytics?.flakeAggregates
      }),
    ...opts,
  })
}
