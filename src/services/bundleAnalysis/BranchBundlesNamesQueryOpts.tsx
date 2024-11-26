import { queryOptions as queryOptionsV5 } from '@tanstack/react-queryV5'
import { z } from 'zod'

import { MissingHeadReportSchema } from 'services/comparison'
import {
  RepoNotFoundErrorSchema,
  RepoOwnerNotActivatedErrorSchema,
} from 'services/repo'
import Api from 'shared/api'
import { rejectNetworkError } from 'shared/api/helpers'
import A from 'ui/A'

const BundleSchema = z.object({
  name: z.string(),
})

const BundleAnalysisReportSchema = z.object({
  __typename: z.literal('BundleAnalysisReport'),
  bundles: z.array(BundleSchema),
})

const BundleReportSchema = z.discriminatedUnion('__typename', [
  BundleAnalysisReportSchema,
  MissingHeadReportSchema,
])

const RepositorySchema = z.object({
  __typename: z.literal('Repository'),
  branch: z
    .object({
      head: z
        .object({
          bundleAnalysis: z
            .object({
              bundleAnalysisReport: BundleReportSchema.nullable(),
            })
            .nullable(),
        })
        .nullable(),
    })
    .nullable(),
})

const BranchBundleSummaryDataSchema = z.object({
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

const query = `query BranchBundlesNames(
  $owner: String!
  $repo: String!
  $branch: String!
) {
  owner(username: $owner) {
    repository(name: $repo) {
      __typename
      ... on Repository {
        branch(name: $branch) {
          head {
            bundleAnalysis {
              bundleAnalysisReport {
                __typename
                ... on BundleAnalysisReport {
                  bundles {
                    name
                  }
                }
                ... on MissingHeadReport {
                  message
                }
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

interface BranchBundlesNamesQueryOptsArgs {
  provider: string
  owner: string
  repo: string
  branch: string
  opts?: {
    enabled?: boolean
  }
}

export const BranchBundlesNamesQueryOpts = ({
  provider,
  owner,
  repo,
  branch,
  opts = {},
}: BranchBundlesNamesQueryOptsArgs) =>
  queryOptionsV5({
    queryKey: ['BranchBundlesNames', provider, owner, repo, branch],
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
        const parsedData = BranchBundleSummaryDataSchema.safeParse(res?.data)

        if (!parsedData.success) {
          return rejectNetworkError({
            status: 404,
            data: {},
            dev: 'BranchBundlesNamesQueryOpts - 404 Failed to parse',
            error: parsedData.error,
          })
        }

        const data = parsedData.data

        if (data?.owner?.repository?.__typename === 'NotFoundError') {
          return rejectNetworkError({
            status: 404,
            data: {},
            dev: 'BranchBundlesNamesQueryOpts - 404 Repository not found',
          })
        }

        if (data?.owner?.repository?.__typename === 'OwnerNotActivatedError') {
          return rejectNetworkError({
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
            dev: 'BranchBundlesNamesQueryOpts - 403 Owner not activated',
          })
        }

        let bundles: Array<string> = []
        if (
          data?.owner?.repository?.branch?.head?.bundleAnalysis
            ?.bundleAnalysisReport?.__typename === 'BundleAnalysisReport'
        ) {
          bundles =
            data.owner.repository.branch.head.bundleAnalysis?.bundleAnalysisReport?.bundles?.map(
              ({ name }) => name
            )
        }

        return { bundles }
      }),
    enabled: opts?.enabled,
  })
