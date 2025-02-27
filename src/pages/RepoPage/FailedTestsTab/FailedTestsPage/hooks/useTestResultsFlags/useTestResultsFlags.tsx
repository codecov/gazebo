import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { z } from 'zod'

import { RepoNotFoundErrorSchema } from 'services/repo/schemas/RepoNotFoundError'
import Api from 'shared/api'
import { rejectNetworkError } from 'shared/api/rejectNetworkError'

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
        const callingFn = 'useTestResultsFlags'
        const parsedData = TestResultsFlagsSchema.safeParse(res?.data)

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

        return {
          flags: data?.owner?.repository?.testAnalytics?.flags,
        }
      }),
  })
}
