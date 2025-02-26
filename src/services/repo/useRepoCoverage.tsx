import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'

import Api from 'shared/api'
import { rejectNetworkError } from 'shared/api/rejectNetworkError'
import A from 'ui/A'

import { RepoNotFoundErrorSchema } from './schemas/RepoNotFoundError'
import { RepoOwnerNotActivatedErrorSchema } from './schemas/RepoOwnerNotActivatedError'

const CommitSchema = z.object({
  yamlState: z.literal('DEFAULT').nullable(),
  coverageAnalytics: z
    .object({
      totals: z
        .object({
          percentCovered: z.number().nullable(),
          lineCount: z.number().nullable(),
          hitsCount: z.number().nullable(),
        })
        .nullable(),
    })
    .nullable(),
})

const BranchSchema = z.object({
  name: z.string(),
  head: CommitSchema.nullable(),
})

const RepositorySchema = z.object({
  __typename: z.literal('Repository'),
  branch: BranchSchema.nullable(),
})

const ResponseSchema = z.object({
  owner: z
    .object({
      repository: z
        .discriminatedUnion('__typename', [
          RepositorySchema,
          RepoNotFoundErrorSchema,
          RepoOwnerNotActivatedErrorSchema,
        ])
        .nullable(),
    })
    .nullable(),
})

const query = `
  query GetRepoCoverage($owner: String!, $repo: String!, $branch: String!) {
    owner(username: $owner) {
      repository: repository(name: $repo) {
        __typename
        ... on Repository {
          branch(name: $branch) {
            name
            head {
              yamlState
              coverageAnalytics {
                totals {
                  percentCovered
                  lineCount
                  hitsCount
                }
              }
            }
          }
        }
        ... on NotFoundError {
          message
        }
        ... on OwnerNotActivatedError {
          message
        }
      }
    }
  }
`

interface UseRepoCoverageArgs {
  provider: string
  owner: string
  repo: string
  branch: string
  options?: {
    enabled?: boolean
  }
}

export function useRepoCoverage({
  provider,
  owner,
  repo,
  branch,
  options = {},
}: UseRepoCoverageArgs) {
  return useQuery({
    queryKey: ['coverage', provider, owner, repo, branch],
    queryFn: ({ signal }) =>
      Api.graphql({
        provider,
        query,
        signal,
        variables: {
          owner,
          repo,
          branch,
        },
      }).then((res) => {
        const parsedRes = ResponseSchema.safeParse(res?.data)

        if (!parsedRes.success) {
          return rejectNetworkError({
            errorName: 'Parsing Error',
            errorDetails: {
              callingFn: 'useRepoCoverage',
              error: parsedRes.error,
            },
          })
        }

        const { data } = parsedRes

        if (data?.owner?.repository?.__typename === 'NotFoundError') {
          return rejectNetworkError({
            errorName: 'Not Found Error',
            errorDetails: {
              callingFn: 'useRepoCoverage',
            },
          })
        }

        if (data?.owner?.repository?.__typename === 'OwnerNotActivatedError') {
          return rejectNetworkError({
            errorName: 'Owner Not Activated',
            errorDetails: {
              callingFn: 'useRepoCoverage',
            },
            data: {
              detail: (
                <p>
                  Activation is required to view this repo, please{' '}
                  {/* @ts-expect-error - A hasn't been typed yet */}
                  <A to={{ pageName: 'membersTab' }}>click here </A> to activate
                  your account.
                </p>
              ),
            },
          })
        }

        return data?.owner?.repository?.branch ?? null
      }),
    ...options,
  })
}
