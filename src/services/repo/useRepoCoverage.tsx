import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'

import Api from 'shared/api'
import { NetworkErrorObject } from 'shared/api/helpers'
import A from 'ui/A'

import {
  RepoNotFoundErrorSchema,
  RepoOwnerNotActivatedErrorSchema,
} from './schemas'

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
          return Promise.reject({
            status: 404,
            data: {},
            dev: 'useRepoCoverage - 404 failed to parse',
          } satisfies NetworkErrorObject)
        }

        const { data } = parsedRes

        if (data?.owner?.repository?.__typename === 'NotFoundError') {
          return Promise.reject({
            status: 404,
            data: {},
            dev: 'useRepoCoverage - 404 NotFoundError',
          } satisfies NetworkErrorObject)
        }

        if (data?.owner?.repository?.__typename === 'OwnerNotActivatedError') {
          return Promise.reject({
            status: 403,
            data: {
              detail: (
                <p>
                  Activation is required to view this repo, please{' '}
                  {/* @ts-expect-error */}
                  <A to={{ pageName: 'membersTab' }}>click here </A> to activate
                  your account.
                </p>
              ),
            },
            dev: 'useRepoCoverage - 403 OwnerNotActivated Error',
          } satisfies NetworkErrorObject)
        }

        return data?.owner?.repository?.branch ?? null
      }),
    ...options,
  })
}
