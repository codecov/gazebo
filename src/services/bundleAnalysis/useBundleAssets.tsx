import { useQuery } from '@tanstack/react-query'
import isNull from 'lodash/isNull'
import { z } from 'zod'

import { MissingHeadReportSchema } from 'services/comparison'
import {
  RepoNotFoundErrorSchema,
  RepoOwnerNotActivatedErrorSchema,
  useRepoOverview,
} from 'services/repo'
import Api from 'shared/api'
import { type NetworkErrorObject } from 'shared/api/helpers'
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

const AssetMeasurementsSchema = z.object({
  change: z
    .object({
      size: z.object({
        uncompress: z.number(),
      }),
    })
    .nullable(),
  measurements: z
    .array(
      z.object({
        timestamp: z.string(),
        avg: z.number().nullable(),
      })
    )
    .nullable(),
})

const BundleAssetSchema = z.object({
  name: z.string(),
  extension: z.string(),
  bundleData: BundleDataSchema,
  measurements: AssetMeasurementsSchema.nullable(),
})

type BundleAsset = z.infer<typeof BundleAssetSchema>

const BundleAnalysisReportSchema = z.object({
  __typename: z.literal('BundleAnalysisReport'),
  bundle: z
    .object({
      bundleData: z.object({
        size: z.object({
          uncompress: z.number(),
        }),
      }),
      assets: z.array(BundleAssetSchema),
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
          bundleAnalysisReport: BundleReportSchema.nullable(),
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
query BundleAssets(
  $owner: String!
  $repo: String!
  $branch: String!
  $bundle: String!
  $interval: MeasurementInterval!
  $before: DateTime!
  $after: DateTime
) {
  owner(username: $owner) {
    repository(name: $repo) {
      __typename
      ... on Repository {
        branch(name: $branch) {
          head {
            bundleAnalysisReport {
              __typename
              ... on BundleAnalysisReport {
                bundle(name: $bundle) {
                  bundleData {
                    size {
                      uncompress
                    }
                  }
                  assets {
                    name
                    extension
                    bundleData {
                      loadTime {
                        threeG
                        highSpeed
                      }
                      size {
                        uncompress
                        gzip
                      }
                    }
                    measurements(
                      interval: $interval
                      before: $before
                      after: $after
                      branch: $branch
                    ) {
                      change {
                        size {
                          uncompress
                        }
                      }
                     	measurements {
                        timestamp
                        avg
                      }
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
      ... on NotFoundError {
        message
      }
      ... on OwnerNotActivatedError {
        message
      }
    }
  }
}`

interface UseBundleAssetsArgs {
  provider: string
  owner: string
  repo: string
  branch?: string
  bundle: string
  interval?: 'INTERVAL_1_DAY' | 'INTERVAL_7_DAY' | 'INTERVAL_30_DAY'
  before?: Date
  after?: Date | null
  opts?: {
    enabled?: boolean
    suspense?: boolean
  }
}

export const useBundleAssets = ({
  provider,
  owner,
  repo,
  branch: branchArg,
  bundle,
  interval,
  before,
  after,
  opts,
}: UseBundleAssetsArgs) => {
  const { data: repoOverview, isSuccess } = useRepoOverview({
    provider,
    repo,
    owner,
    opts: {
      enabled: !branchArg,
    },
  })

  let enabled = true
  if (opts?.enabled !== undefined) {
    enabled = opts.enabled
  }

  if (opts?.enabled !== undefined && !branchArg) {
    enabled = opts.enabled && isSuccess
  }

  const branch = branchArg ?? repoOverview?.defaultBranch

  return useQuery({
    queryKey: [
      'BundleAssets',
      provider,
      owner,
      repo,
      branch,
      bundle,
      interval,
      before,
      after,
    ],
    queryFn: ({ signal }) =>
      Api.graphql({
        provider,
        signal,
        query,
        variables: {
          owner,
          repo,
          branch,
          bundle,
          interval,
          before,
          after,
        },
      }).then((res) => {
        const parsedData = RequestSchema.safeParse(res?.data)

        if (!parsedData.success) {
          return Promise.reject({
            status: 404,
            data: {},
            dev: 'useBundleAssets - 404 Failed to parse schema',
          } satisfies NetworkErrorObject)
        }

        const data = parsedData.data

        if (data?.owner?.repository?.__typename === 'NotFoundError') {
          return Promise.reject({
            status: 404,
            data: {},
            dev: 'useBundleAssets - 404 Not found error',
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
            dev: 'useBundleAssets - 403 Owner not activated',
          } satisfies NetworkErrorObject)
        }

        let assets: Array<BundleAsset> = []
        let bundleUncompressSize: number | null = null
        if (
          data?.owner?.repository?.branch?.head?.bundleAnalysisReport
            ?.__typename === 'BundleAnalysisReport' &&
          !isNull(data.owner.repository.branch.head.bundleAnalysisReport.bundle)
        ) {
          bundleUncompressSize =
            data.owner.repository.branch.head.bundleAnalysisReport.bundle
              .bundleData.size.uncompress
          assets =
            data.owner.repository.branch.head.bundleAnalysisReport.bundle.assets
        }

        return { assets, bundleUncompressSize }
      }),
    enabled: enabled,
    suspense: !!opts?.suspense,
  })
}
