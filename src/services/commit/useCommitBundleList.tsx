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

const BundleSchema = z.object({
  name: z.string(),
  changeType: z.string(),
  bundleChange: z.object({
    loadTime: z.object({
      threeG: z.number(),
    }),
    size: z.object({
      uncompress: z.number(),
    }),
  }),
  bundleData: z.object({
    loadTime: z.object({
      threeG: z.number(),
    }),
    size: z.object({
      uncompress: z.number(),
    }),
  }),
})

const BAComparisonSchema = z.object({
  __typename: z.literal('BundleAnalysisComparison'),
  bundles: z.array(BundleSchema),
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
  commit: z
    .object({
      bundleAnalysis: z
        .object({
          bundleAnalysisCompareWithParent:
            BundleAnalysisCompareWithParentSchema.nullable(),
        })
        .nullable(),
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
query CommitBundleList($owner: String!, $repo: String!, $commitid: String!) {
  owner(username: $owner) {
    repository(name: $repo) {
      __typename
      ... on Repository {
        commit(id: $commitid) {
          bundleAnalysis {
            bundleAnalysisCompareWithParent {
              __typename
              ... on BundleAnalysisComparison {
                bundles {
                  name
                  changeType
                  bundleChange {
                    loadTime {
                      threeG
                    }
                    size {
                      uncompress
                    }
                  }
                  bundleData {
                    loadTime {
                      threeG
                    }
                    size {
                      uncompress
                    }
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

interface UseCommitBundleListArgs {
  provider: string
  owner: string
  repo: string
  commitid: string
}

export function useCommitBundleList({
  provider,
  owner,
  repo,
  commitid,
}: UseCommitBundleListArgs) {
  return useQuery({
    queryKey: ['CommitBundleList', provider, owner, repo, commitid],
    queryFn: ({ signal }) =>
      Api.graphql({
        provider,
        query,
        signal,
        variables: {
          owner,
          repo,
          commitid,
        },
      }).then((res) => {
        const parsedRes = RequestSchema.safeParse(res?.data)

        if (!parsedRes.success) {
          return Promise.reject({
            status: 404,
            data: {},
            dev: `useCommitBundleList - 404 failed to parse`,
          } satisfies NetworkErrorObject)
        }

        const data = parsedRes.data

        if (data?.owner?.repository?.__typename === 'NotFoundError') {
          return Promise.reject({
            status: 404,
            data: {},
            dev: `useCommitBundleList - 404 NotFoundError`,
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
            dev: `useCommitBundleList - 403 OwnerNotActivatedError`,
          } satisfies NetworkErrorObject)
        }

        return {
          commit: data?.owner?.repository?.commit ?? null,
        }
      }),
  })
}
