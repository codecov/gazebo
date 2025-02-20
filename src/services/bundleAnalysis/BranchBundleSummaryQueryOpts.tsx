import { queryOptions as queryOptionsV5 } from '@tanstack/react-queryV5'
import { z } from 'zod'

import { MissingHeadReportSchema } from 'services/comparison/schemas/MissingHeadReport'
import {
  RepoNotFoundErrorSchema,
  RepoOwnerNotActivatedErrorSchema,
} from 'services/repo'
import Api from 'shared/api'
import { rejectNetworkError } from 'shared/api/rejectNetworkError'
import A from 'ui/A'

const BundleSchema = z.object({
  name: z.string(),
  bundleData: z.object({
    loadTime: z.object({
      threeG: z.number(),
    }),
    size: z.object({
      uncompress: z.number(),
    }),
  }),
})

const BundleAnalysisReportSchema = z.object({
  __typename: z.literal('BundleAnalysisReport'),
  bundleData: z.object({
    loadTime: z.object({
      threeG: z.number(),
    }),
    size: z.object({
      uncompress: z.number(),
    }),
  }),
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
          commitid: z.string(),
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

const ConfigSchema = z.object({
  isTimescaleEnabled: z.boolean(),
})

const BranchBundleSummaryDataSchema = z.object({
  config: ConfigSchema,
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

const query = `query BranchBundleSummaryData(
  $owner: String!
  $repo: String!
  $branch: String!
) {
  config {
    isTimescaleEnabled
  }
  owner(username: $owner) {
    repository(name: $repo) {
      __typename
      ... on Repository {
        branch(name: $branch) {
          head {
            commitid
            bundleAnalysis {
              bundleAnalysisReport {
                __typename
                ... on BundleAnalysisReport {
                  bundleData {
                    loadTime {
                      threeG
                    }
                    size {
                      uncompress
                    }
                  }
                  bundles {
                    name
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

export interface BranchBundleSummaryQueryOptsArgs {
  provider: string
  owner: string
  repo: string
  branch: string | null | undefined
}

export const BranchBundleSummaryQueryOpts = ({
  provider,
  owner,
  repo,
  branch,
}: BranchBundleSummaryQueryOptsArgs) =>
  queryOptionsV5({
    queryKey: ['BranchBundleSummaryData', provider, owner, repo, branch],
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
            errorName: 'Parsing Error',
            errorDetails: {
              callingFn: 'BranchBundleSummaryQueryOpts',
              error: parsedData.error,
            },
          })
        }

        const data = parsedData.data

        if (data?.owner?.repository?.__typename === 'NotFoundError') {
          return rejectNetworkError({
            errorName: 'Not Found Error',
            errorDetails: { callingFn: 'BranchBundleSummaryQueryOpts' },
          })
        }

        if (data?.owner?.repository?.__typename === 'OwnerNotActivatedError') {
          return rejectNetworkError({
            errorName: 'Owner Not Activated',
            errorDetails: { callingFn: 'BranchBundleSummaryQueryOpts' },
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

        const branch = data?.owner?.repository?.branch ?? null
        const config = data?.config ?? { isTimescaleEnabled: false }

        return { config, branch }
      }),
  })
