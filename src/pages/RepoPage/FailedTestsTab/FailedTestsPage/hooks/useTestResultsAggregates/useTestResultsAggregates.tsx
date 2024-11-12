import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { z } from 'zod'

import { MeasurementInterval } from 'pages/RepoPage/shared/constants'
import { RepoNotFoundErrorSchema } from 'services/repo'
import Api from 'shared/api'
import { NetworkErrorObject, rejectNetworkError } from 'shared/api/helpers'

const TestResultsAggregatesSchema = z.object({
  owner: z
    .object({
      plan: z
        .object({
          value: z.string(),
        })
        .nullable(),
      repository: z.discriminatedUnion('__typename', [
        z.object({
          __typename: z.literal('Repository'),
          private: z.boolean().nullable(),
          defaultBranch: z.string().nullable(),
          testAnalytics: z
            .object({
              testResultsAggregates: z
                .object({
                  totalDuration: z.number(),
                  totalDurationPercentChange: z.number().nullable(),
                  slowestTestsDuration: z.number(),
                  slowestTestsDurationPercentChange: z.number().nullable(),
                  totalSlowTests: z.number(),
                  totalSlowTestsPercentChange: z.number().nullable(),
                  totalFails: z.number(),
                  totalFailsPercentChange: z.number().nullable(),
                  totalSkips: z.number(),
                  totalSkipsPercentChange: z.number().nullable(),
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
  query GetTestResultsAggregates(
    $owner: String!
    $repo: String!
    $interval: MeasurementInterval
  ) {
    owner(username: $owner) {
      plan {
        value
      }
      repository: repository(name: $repo) {
        __typename
        ... on Repository {
            private
            defaultBranch
            testAnalytics {
              testResultsAggregates(interval: $interval) {
                totalDuration
                totalDurationPercentChange
                slowestTestsDuration
                slowestTestsDurationPercentChange
                totalSlowTests
                totalSlowTestsPercentChange
                totalFails
                totalFailsPercentChange
                totalSkips
                totalSkipsPercentChange
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

export const useTestResultsAggregates = ({
  interval,
}: {
  interval?: MeasurementInterval
}) => {
  const { provider, owner, repo } = useParams<URLParams>()

  return useQuery({
    queryKey: ['GetTestResultsAggregates', provider, owner, repo, interval],
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
        const parsedData = TestResultsAggregatesSchema.safeParse(res?.data)

        if (!parsedData.success) {
          return rejectNetworkError({
            status: 404,
            data: {},
            dev: 'useTestResultsAggregates - 404 Failed to parse data',
            error: parsedData.error,
          } satisfies NetworkErrorObject)
        }

        const data = parsedData.data

        if (data?.owner?.repository?.__typename === 'NotFoundError') {
          return rejectNetworkError({
            status: 404,
            data: {},
            dev: 'useTestResultsAggregates - 404 Not found error',
          } satisfies NetworkErrorObject)
        }

        return {
          testResultsAggregates:
            data?.owner?.repository?.testAnalytics?.testResultsAggregates,
          plan: data?.owner?.plan?.value,
          private: data?.owner?.repository?.private,
          defaultBranch: data?.owner?.repository?.defaultBranch,
        }
      }),
  })
}
