import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { z } from 'zod'

import { RepoNotFoundErrorSchema } from 'services/repo'
import Api from 'shared/api'
import { NetworkErrorObject, rejectNetworkError } from 'shared/api/helpers'
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
                      errorMessage: z.string(),
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
        const parsedData = TestResultsTestSuitesSchema.safeParse(res?.data)
        console.log('parsedData', parsedData.error)

        if (!parsedData.success) {
          return rejectNetworkError({
            status: 404,
            data: {},
            dev: 'useTestResultsTestSuites - 404 Failed to parse data',
            error: parsedData.error,
          } satisfies NetworkErrorObject)
        }
        const data = parsedData.data

        if (data?.owner?.repository?.__typename === 'NotFoundError') {
          return rejectNetworkError({
            status: 404,
            data: {},
            dev: 'useTestResultsTestSuites - 404 Not found error',
          } satisfies NetworkErrorObject)
        }

        return {
          testSuites: data?.owner?.repository?.testAnalytics?.testSuites,
          latestUploadError:
            data?.owner?.repository?.branch?.head?.latestUploadError ?? null,
        }
      }),
  })
}
