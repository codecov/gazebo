import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { z } from 'zod'

import { RepoNotFoundErrorSchema } from 'services/repo'
import Api from 'shared/api'
import { NetworkErrorObject, rejectNetworkError } from 'shared/api/helpers'

const TestResultsFlagsSchema = z.object({
  owner: z
    .object({
      repository: z.discriminatedUnion('__typename', [
        z.object({
          __typename: z.literal('Repository'),
          testAnalytics: z
            .object({
              flags: z.array(z.string()),
            })
            .nullable(),
        }),
        RepoNotFoundErrorSchema,
      ]),
    })
    .nullable(),
})

const query = `
  query GetTestResultsFlags(
    $owner: String!
    $repo: String!
    $term: String
  ) {
    owner(username: $owner) {
      repository: repository(name: $repo) {
        __typename
        ... on Repository {
            testAnalytics {
             flags(term: $term)
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

export const useTestResultsFlags = ({ term }: { term?: string }) => {
  const { provider, owner, repo } = useParams<URLParams>()

  return useQuery({
    queryKey: ['GetTestResultsFlags', provider, owner, repo, term],
    queryFn: ({ signal }) =>
      Api.graphql({
        provider,
        query,
        signal,
        variables: {
          provider,
          owner,
          repo,
          term,
        },
      }).then((res) => {
        const parsedData = TestResultsFlagsSchema.safeParse(res?.data)

        if (!parsedData.success) {
          return rejectNetworkError({
            status: 404,
            data: {},
            dev: 'useTestResultsFlags - 404 Failed to parse data',
            error: parsedData.error,
          } satisfies NetworkErrorObject)
        }

        const data = parsedData.data

        if (data?.owner?.repository?.__typename === 'NotFoundError') {
          return rejectNetworkError({
            status: 404,
            data: {},
            dev: 'useTestResultsFlags - 404 Not found error',
          } satisfies NetworkErrorObject)
        }

        return {
          flags: data?.owner?.repository?.testAnalytics?.flags,
        }
      }),
  })
}
