import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { z } from 'zod'

import { MeasurementInterval } from 'pages/RepoPage/shared/constants'
import { RepoNotFoundErrorSchema } from 'services/repo'
import Api from 'shared/api'
import { rejectNetworkError } from 'shared/api/rejectNetworkError'
import { Plans } from 'shared/utils/billing'

const TestResultsAggregatesSchema = z.object({
  owner: z
    .object({
      plan: z
        .object({
          value: z.nativeEnum(Plans),
          isFreePlan: z.boolean(),
          isTeamPlan: z.boolean(),
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
        isFreePlan
        isTeamPlan
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
            errorName: 'Parsing Error',
            errorDetails: {
              callingFn: 'useTestResultsAggregates',
              error: parsedData.error,
            },
          })
        }

        const data = parsedData.data

        if (data?.owner?.repository?.__typename === 'NotFoundError') {
          return rejectNetworkError({
            errorName: 'Not Found Error',
            errorDetails: { callingFn: 'useTestResultsAggregates' },
          })
        }

        return {
          testResultsAggregates:
            data?.owner?.repository?.testAnalytics?.testResultsAggregates,
          planName: data?.owner?.plan?.value,
          isFreePlan: data?.owner?.plan?.isFreePlan,
          isTeamPlan: data?.owner?.plan?.isTeamPlan,
          private: data?.owner?.repository?.private,
          defaultBranch: data?.owner?.repository?.defaultBranch,
        }
      }),
  })
}
