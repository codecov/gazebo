import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { z } from 'zod'

import { RepoNotFoundErrorSchema } from 'services/repo'
import Api from 'shared/api'
import { NetworkErrorObject } from 'shared/api/helpers'

const FlakeAggregatesSchema = z.object({
  owner: z
    .object({
      repository: z.discriminatedUnion('__typename', [
        z.object({
          __typename: z.literal('Repository'),
          testAnalytics: z
            .object({
              flakeAggregates: z.object({
                flakeCount: z.number(),
                flakeCountPercentChange: z.number().nullable(),
                flakeRate: z.number(),
                flakeRatePercentChange: z.number().nullable(),
              }),
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

export enum MeasurementInterval {
  INTERVAL_1_DAY = 'INTERVAL_1_DAY',
  INTERVAL_7_DAY = 'INTERVAL_7_DAY',
  INTERVAL_30_DAY = 'INTERVAL_30_DAY',
}

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
        const parsedData = FlakeAggregatesSchema.safeParse(res?.data)

        if (!parsedData.success) {
          return Promise.reject({
            status: 404,
            data: {},
            dev: 'useFlakeAggregates - 404 Failed to parse data',
          } satisfies NetworkErrorObject)
        }

        const data = parsedData.data

        if (data?.owner?.repository?.__typename === 'NotFoundError') {
          return Promise.reject({
            status: 404,
            data: {},
            dev: 'useFlakeAggregates - 404 Not found error',
          } satisfies NetworkErrorObject)
        }

        return data.owner?.repository.testAnalytics?.flakeAggregates
      }),
    ...opts,
  })
}
