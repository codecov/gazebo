import { queryOptions as queryOptionsV5 } from '@tanstack/react-queryV5'
import { z } from 'zod'

import {
  FirstPullRequestSchema,
  MissingBaseCommitSchema,
  MissingBaseReportSchema,
  MissingComparisonSchema,
  MissingHeadCommitSchema,
  MissingHeadReportSchema,
} from 'services/comparison'
import {
  RepoNotFoundErrorSchema,
  RepoOwnerNotActivatedErrorSchema,
} from 'services/repo'
import Api from 'shared/api'
import { rejectNetworkError } from 'shared/api/helpers'
import A from 'ui/A'

const BundleAnalysisReportSchema = z.object({
  __typename: z.literal('BundleAnalysisReport'),
  isCached: z.boolean(),
})

const BundleAnalysisReportUnion = z.union([
  BundleAnalysisReportSchema,
  MissingHeadReportSchema.shape.__typename,
])

const BundleAnalysisComparisonResult = z.union([
  z.literal('BundleAnalysisComparison'),
  FirstPullRequestSchema.shape.__typename,
  MissingBaseCommitSchema.shape.__typename,
  MissingComparisonSchema.shape.__typename,
  MissingHeadCommitSchema.shape.__typename,
  MissingHeadReportSchema.shape.__typename,
  MissingBaseReportSchema.shape.__typename,
])

export type TBundleAnalysisComparisonResult = z.infer<
  typeof BundleAnalysisComparisonResult
>

const RepositorySchema = z.object({
  __typename: z.literal('Repository'),
  private: z.boolean(),
  bundleAnalysisEnabled: z.boolean().nullable(),
  coverageEnabled: z.boolean().nullable(),
  commit: z
    .object({
      commitid: z.string(),
      compareWithParent: z
        .object({
          __typename: z.union([
            z.literal('Comparison'),
            FirstPullRequestSchema.shape.__typename,
            MissingBaseCommitSchema.shape.__typename,
            MissingBaseReportSchema.shape.__typename,
            MissingComparisonSchema.shape.__typename,
            MissingHeadCommitSchema.shape.__typename,
            MissingHeadReportSchema.shape.__typename,
          ]),
        })
        .nullable(),
      bundleAnalysis: z
        .object({
          bundleAnalysisReport: BundleAnalysisReportUnion.nullable(),
          bundleAnalysisCompareWithParent: z
            .object({
              __typename: BundleAnalysisComparisonResult,
            })
            .nullable(),
        })
        .nullable(),
    })
    .nullable(),
})

const CommitPageDataSchema = z.object({
  owner: z
    .object({
      isCurrentUserPartOfOrg: z.boolean(),
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

export type CommitPageData = z.infer<typeof CommitPageDataSchema>

const query = `
query CommitPageData($owner: String!, $repo: String!, $commitId: String!) {
  owner(username: $owner) {
    isCurrentUserPartOfOrg
    repository(name: $repo) {
      __typename
      ... on Repository {
        private
        bundleAnalysisEnabled
        coverageEnabled
        commit(id: $commitId) {
          commitid
          compareWithParent {
            __typename
          }
          bundleAnalysis {
            bundleAnalysisReport {
              __typename
              ... on BundleAnalysisReport {
                isCached
              }
            }
            bundleAnalysisCompareWithParent {
              __typename
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

interface CommitPageDataQueryArgs {
  provider: string
  owner: string
  repo: string
  commitId: string
}

export const CommitPageDataQueryOpts = ({
  provider,
  owner,
  repo,
  commitId,
}: CommitPageDataQueryArgs) =>
  queryOptionsV5({
    queryKey: ['CommitPageData', provider, owner, repo, commitId, query],
    queryFn: ({ signal }) =>
      Api.graphql({
        provider,
        query,
        signal,
        variables: {
          provider,
          owner,
          repo,
          commitId,
        },
      }).then((res) => {
        const parsedData = CommitPageDataSchema.safeParse(res?.data)

        if (!parsedData.success) {
          return rejectNetworkError({
            status: 404,
            data: {},
            dev: 'CommitPageDataQueryOpts - 404 Failed to parse schema',
            error: parsedData.error,
          })
        }

        const { data } = parsedData

        if (data?.owner?.repository?.__typename === 'NotFoundError') {
          return rejectNetworkError({
            status: 404,
            data: {},
            dev: 'CommitPageDataQueryOpts - 404 Not found',
          })
        }

        if (data?.owner?.repository?.__typename === 'OwnerNotActivatedError') {
          return rejectNetworkError({
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
            dev: 'CommitPageDataQueryOpts - 403 Owner not activated',
          })
        }

        const isCurrentUserPartOfOrg =
          data?.owner?.isCurrentUserPartOfOrg ?? null
        const isPrivate = data?.owner?.repository?.private ?? null
        const bundleAnalysisEnabled =
          data?.owner?.repository?.bundleAnalysisEnabled ?? null
        const coverageEnabled = data?.owner?.repository?.coverageEnabled ?? null
        const commit = data?.owner?.repository?.commit ?? null

        return {
          isCurrentUserPartOfOrg,
          private: isPrivate,
          bundleAnalysisEnabled,
          coverageEnabled,
          commit,
        }
      }),
  })
