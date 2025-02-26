import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'

import { FirstPullRequestSchema } from 'services/comparison/schemas/FirstPullRequest'
import { MissingBaseCommitSchema } from 'services/comparison/schemas/MissingBaseCommit'
import { MissingBaseReportSchema } from 'services/comparison/schemas/MissingBaseReport'
import { MissingHeadCommitSchema } from 'services/comparison/schemas/MissingHeadCommit'
import { MissingHeadReportSchema } from 'services/comparison/schemas/MissingHeadReport'
import { RepoNotFoundErrorSchema } from 'services/repo/schemas/RepoNotFoundError'
import { RepoOwnerNotActivatedErrorSchema } from 'services/repo/schemas/RepoOwnerNotActivatedError'
import Api from 'shared/api'
import { rejectNetworkError } from 'shared/api/rejectNetworkError'
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
          return rejectNetworkError({
            errorName: 'Parsing Error',
            errorDetails: {
              callingFn: 'usePullBADropdownSummary',
              error: parsedRes.error,
            },
          })
        }

        const data = parsedRes.data

        if (data?.owner?.repository?.__typename === 'NotFoundError') {
          return rejectNetworkError({
            errorName: 'Not Found Error',
            errorDetails: { callingFn: 'usePullBADropdownSummary' },
          })
        }

        if (data?.owner?.repository?.__typename === 'OwnerNotActivatedError') {
          return rejectNetworkError({
            errorName: 'Owner Not Activated',
            errorDetails: { callingFn: 'usePullBADropdownSummary' },
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

        const pull = data?.owner?.repository?.pull ?? null

        return { pull }
      }),
  })
}
