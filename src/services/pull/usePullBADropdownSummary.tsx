import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'

import {
  FirstPullRequestSchema,
  MissingBaseCommitSchema,
  MissingBaseReportSchema,
  MissingHeadCommitSchema,
  MissingHeadReportSchema,
} from 'services/comparison/schemas'
import {
  RepoNotFoundErrorSchema,
  RepoOwnerNotActivatedErrorSchema,
} from 'services/repo/schemas'
import Api from 'shared/api'
import { type NetworkErrorObject } from 'shared/api/helpers'
import A from 'ui/A'

const BAComparisonSchema = z.object({
  __typename: z.literal('BundleAnalysisComparison'),
  bundleChange: z.object({
    loadTime: z.object({
      threeG: z.number(),
    }),
    size: z.object({
      uncompress: z.number(),
    }),
  }),
})

const BundleAnalysisCompareWithParentSchema = z
  .discriminatedUnion('__typename', [
    BAComparisonSchema,
    FirstPullRequestSchema,
    MissingBaseCommitSchema,
    MissingBaseReportSchema,
    MissingHeadCommitSchema,
    MissingHeadReportSchema,
  ])
  .nullable()

const RepositorySchema = z.object({
  __typename: z.literal('Repository'),
  pull: z
    .object({
      head: z
        .object({
          commitid: z.string(),
        })
        .nullable(),
      bundleAnalysisCompareWithBase:
        BundleAnalysisCompareWithParentSchema.nullable(),
    })
    .nullable(),
})

const RequestSchema = z.object({
  owner: z
    .object({
      repository: z.discriminatedUnion('__typename', [
        RepositorySchema,
        RepoNotFoundErrorSchema,
        RepoOwnerNotActivatedErrorSchema,
      ]),
    })
    .nullable(),
})

const query = `
query PullBADropdownSummary($owner: String!, $repo: String!, $pullId: Int!) {
  owner(username: $owner) {
    repository(name: $repo) {
      __typename
      ... on Repository {
        pull(id: $pullId) {
          head {
            commitid
          }
          bundleAnalysisCompareWithBase {
            __typename
            ... on BundleAnalysisComparison {
              bundleChange {
                loadTime {
                  threeG
                }
                size {
                  uncompress
                }
              }
            }
            ... on FirstPullRequest {
              message
            }
            ... on MissingBaseCommit {
              message
            }
            ... on MissingHeadCommit {
              message
            }
            ... on MissingBaseReport {
              message
            }
            ... on MissingHeadReport {
              message
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
}`

interface UsePullBADropdownSummaryArgs {
  provider: string
  owner: string
  repo: string
  pullId: number
}

export function usePullBADropdownSummary({
  provider,
  owner,
  repo,
  pullId,
}: UsePullBADropdownSummaryArgs) {
  return useQuery({
    queryKey: ['PullBADropdownSummary', provider, owner, repo, pullId],
    queryFn: ({ signal }) =>
      Api.graphql({
        provider,
        query,
        signal,
        variables: {
          owner,
          repo,
          pullId,
        },
      }).then((res) => {
        const parsedRes = RequestSchema.safeParse(res?.data)

        if (!parsedRes.success) {
          return Promise.reject({
            status: 404,
            data: {},
            dev: `usePullBADropdownSummary - 404 failed to parse`,
          } satisfies NetworkErrorObject)
        }

        const data = parsedRes.data

        if (data?.owner?.repository?.__typename === 'NotFoundError') {
          return Promise.reject({
            status: 404,
            data: {},
            dev: `usePullBADropdownSummary - 404 NotFoundError`,
          } satisfies NetworkErrorObject)
        }

        if (data?.owner?.repository?.__typename === 'OwnerNotActivatedError') {
          return Promise.reject({
            status: 403,
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
            dev: `usePullBADropdownSummary - 404 OwnerNotActivatedError`,
          } satisfies NetworkErrorObject)
        }

        const pull = data?.owner?.repository?.pull ?? null

        return { pull }
      }),
  })
}
