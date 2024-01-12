import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'

import {
  FirstPullRequestSchema,
  MissingBaseCommitSchema,
  MissingBaseReportSchema,
  MissingComparisonSchema,
  MissingHeadCommitSchema,
  MissingHeadReportSchema,
} from 'services/comparison/schemas'
import {
  RepoNotFoundErrorSchema,
  RepoOwnerNotActivatedErrorSchema,
} from 'services/repo/schemas'
import Api from 'shared/api'
import A from 'ui/A'

const BundleComparisonSchema = z.object({
  name: z.string(),
  changeType: z.string(),
  sizeDelta: z.number(),
  sizeTotal: z.number(),
  loadTimeDelta: z.number(),
  loadTimeTotal: z.number(),
})

const BAComparisonSchema = z.object({
  __typename: z.literal('BundleAnalysisComparison'),
  bundles: z.array(BundleComparisonSchema),
})

const BundleAnalysisCompareWithBaseSchema = z
  .discriminatedUnion('__typename', [
    BAComparisonSchema,
    FirstPullRequestSchema,
    MissingBaseCommitSchema,
    MissingBaseReportSchema,
    MissingComparisonSchema,
    MissingHeadCommitSchema,
    MissingHeadReportSchema,
  ])
  .nullable()

const RepositorySchema = z.object({
  __typename: z.literal('Repository'),
  pull: z
    .object({
      bundleAnalysisCompareWithBase:
        BundleAnalysisCompareWithBaseSchema.nullable(),
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
query PullBundleList(
  $owner: String!
  $repo: String!
  $pullId: Int!
) {
  owner(username: $owner) {
    repository(name: $repo) {
      __typename
      ... on Repository {
        pull(id: $pullId) {
          bundleAnalysisCompareWithBase {
            __typename
            ... on BundleAnalysisComparison {
              bundles {
                name
                changeType
                sizeDelta
                sizeTotal
                loadTimeDelta
                loadTimeTotal
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
            ... on MissingComparison {
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

interface UsePullBundleListArgs {
  provider: string
  owner: string
  repo: string
  pullId: number
}

export function usePullBundleList({
  provider,
  owner,
  repo,
  pullId,
}: UsePullBundleListArgs) {
  return useQuery({
    queryKey: ['PullBundleList', provider, owner, repo, pullId],
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
            data: null,
          })
        }

        const data = parsedRes.data

        if (data?.owner?.repository?.__typename === 'NotFoundError') {
          return Promise.reject({
            status: 404,
            data: {},
          })
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
          })
        }

        return {
          pull: data?.owner?.repository?.pull ?? null,
        }
      }),
  })
}
