import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { z } from 'zod'

import { RepoNotFoundErrorSchema } from 'services/repo/schemas/RepoNotFoundError'
import Api from 'shared/api'
import { rejectNetworkError } from 'shared/api/rejectNetworkError'
import { ErrorCodeEnum } from 'shared/utils/commit'

const TestResultsTestSuitesSchema = z.object({
  owner: z
    .object({
      repository: z.discriminatedUnion('__typename', [
        z.object({
          __typename: z.literal('Repository'),
          branch: z
            .object({
              head: z
                .object({
                  latestUploadError: z
                    .object({
                      errorCode: z.nativeEnum(ErrorCodeEnum),
                      errorMessage: z.string().nullable(),
                    })
                    .nullable(),
                })
                .nullable(),
            })
            .nullable(),
          testAnalytics: z
            .object({
              testSuites: z.array(z.string()),
            })
            .nullable(),
        }),
        RepoNotFoundErrorSchema,
      ]),
    })
    .nullable(),
})

const query = `
  query GetTestResultsTestSuites(
    $owner: String!
    $repo: String!
    $term: String
    $branch: String!
  ) {
    owner(username: $owner) {
      repository: repository(name: $repo) {
        __typename
        ... on Repository {
            branch(name: $branch) {
              head {
                latestUploadError {
                  errorCode
                  errorMessage
                }
              }
            }
            testAnalytics {
             testSuites(term: $term)
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

export const useTestResultsTestSuites = ({
  term,
  branch,
}: {
  term?: string
  branch?: string
}) => {
  const { provider, owner, repo } = useParams<URLParams>()

  return useQuery({
    queryKey: ['GetTestResultsTestSuites', provider, owner, repo, term, branch],
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
          branch: branch ?? '',
        },
      }).then((res) => {
        const callingFn = 'useTestResultsTestSuites'
        const parsedData = TestResultsTestSuitesSchema.safeParse(res?.data)

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
          testSuites: data?.owner?.repository?.testAnalytics?.testSuites,
          latestUploadError:
            data?.owner?.repository?.branch?.head?.latestUploadError ?? null,
        }
      }),
  })
}
