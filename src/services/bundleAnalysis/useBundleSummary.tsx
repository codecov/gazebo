import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'

import { MissingHeadReportSchema } from 'services/comparison'
import {
  RepoNotFoundErrorSchema,
  RepoOwnerNotActivatedErrorSchema,
  useRepoOverview,
} from 'services/repo'
import Api from 'shared/api/api'
import type { NetworkErrorObject } from 'shared/api/helpers'
import A from 'ui/A'

const BundleDataSchema = z.object({
  loadTime: z.object({
    threeG: z.number(),
    highSpeed: z.number(),
  }),
  size: z.object({
    gzip: z.number(),
    uncompress: z.number(),
  }),
})

const BundleAnalysisReportSchema = z.object({
  __typename: z.literal('BundleAnalysisReport'),
  bundle: z
    .object({
      name: z.string(),
      moduleCount: z.number(),
      bundleData: BundleDataSchema,
    })
    .nullable(),
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

const RequestSchema = z.object({
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
query BundleSummary(
  $owner: String!
  $repo: String!
  $branch: String!
  $bundle: String!
  $filters: BundleAnalysisReportFilters
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
                  bundle(name: $bundle, filters: $filters) {
                    name
                    moduleCount
                    bundleData {
                      loadTime {
                        threeG
                        highSpeed
                      }
                      size {
                        gzip
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

interface UseBundleSummaryArgs {
  provider: string
  owner: string
  repo: string
  branch?: string
  bundle: string
  filters?: {
    reportGroups?: string[]
    loadTypes?: string[]
  }
  opts?: {
    enabled?: boolean
  }
}

export const useBundleSummary = ({
  provider,
  owner,
  repo,
  branch: branchParam,
  bundle,
  filters = {},
  opts = {},
}: UseBundleSummaryArgs) => {
  const { data: overview } = useRepoOverview({
    provider,
    owner,
    repo,
    opts: {
      enabled: !branchParam,
    },
  })

  const branch = branchParam ?? overview?.defaultBranch

  return useQuery({
    queryKey: ['BundleSummary', provider, owner, repo, branch, bundle, filters],
    queryFn: ({ signal }) =>
      Api.graphql({
        provider,
        query,
        signal,
        variables: { owner, repo, branch, bundle, filters },
      }).then((res) => {
        const parsedData = RequestSchema.safeParse(res?.data)

        if (!parsedData.success) {
          return Promise.reject({
            status: 404,
            data: {},
            dev: 'useBundleSummary - 404 Failed to parse data',
            error: parsedData.error,
          } satisfies NetworkErrorObject)
        }

        const data = parsedData.data

        if (data?.owner?.repository?.__typename === 'NotFoundError') {
          return Promise.reject({
            status: 404,
            data: {},
            dev: 'useBundleSummary - 404 Not found error',
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
            dev: 'useBundleSummary - 403 Owner not activated',
          } satisfies NetworkErrorObject)
        }

        let bundleSummary = null
        if (
          data?.owner?.repository?.branch?.head?.bundleAnalysis
            ?.bundleAnalysisReport?.__typename === 'BundleAnalysisReport'
        ) {
          bundleSummary =
            data.owner.repository.branch.head.bundleAnalysis
              .bundleAnalysisReport.bundle
        }

        return { bundleSummary }
      }),
    enabled: opts?.enabled,
  })
}
