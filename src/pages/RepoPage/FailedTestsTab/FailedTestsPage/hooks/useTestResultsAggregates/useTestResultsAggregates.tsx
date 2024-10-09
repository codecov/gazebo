import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { z } from 'zod'

import { RepoNotFoundErrorSchema } from 'services/repo'
import Api from 'shared/api'
import { NetworkErrorObject } from 'shared/api/helpers'

const TestResultsAggregatesSchema = z.object({
  owner: z
    .object({
      repository: z.discriminatedUnion('__typename', [
        z.object({
          __typename: z.literal('Repository'),
          testResultsAggregates: z.object({
            totalDuration: z.number(),
            totalDurationPercentChange: z.number().nullable(),
            slowestTestsDuration: z.number(),
            slowestTestsDurationPercentChange: z.number().nullable(),
            totalFails: z.number(),
            totalFailsPercentChange: z.number().nullable(),
            totalSkips: z.number(),
            totalSkipsPercentChange: z.number().nullable(),
          }),
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
  ) {
    owner(username: $owner) {
      repository: repository(name: $repo) {
        __typename
        ... on Repository {
          testResultsAggregates {
            totalDuration
            totalDurationPercentChange
            slowestTestsDuration
            slowestTestsDurationPercentChange
            totalFails
            totalFailsPercentChange
            totalSkips
            totalSkipsPercentChange
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

export const useTestResultsAggregates = () => {
  const { provider, owner, repo } = useParams<URLParams>()

  return useQuery({
    queryKey: ['GetTestResultsAggregates', provider, owner, repo],
    queryFn: ({ signal }) =>
      Api.graphql({
        provider,
        query,
        signal,
        variables: {
          provider,
          owner,
          repo,
        },
      }).then((res) => {
        const parsedData = TestResultsAggregatesSchema.safeParse(res?.data)

        if (!parsedData.success) {
          return Promise.reject({
            status: 404,
            data: {},
            dev: 'useTestResultsAggregates - 404 Failed to parse data',
          } satisfies NetworkErrorObject)
        }

        const data = parsedData.data

        if (data?.owner?.repository?.__typename === 'NotFoundError') {
          return Promise.reject({
            status: 404,
            data: {},
            dev: 'useTestResultsAggregates - 404 Not found error',
          } satisfies NetworkErrorObject)
        }

        return data.owner?.repository.testResultsAggregates
      }),
  })
}
