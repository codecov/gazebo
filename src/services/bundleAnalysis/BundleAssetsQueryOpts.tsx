import { infiniteQueryOptions as infiniteQueryOptionsV5 } from '@tanstack/react-queryV5'
import { z } from 'zod'

import { OrderingDirection } from 'types'

import { MissingHeadReportSchema } from 'services/comparison'
import {
  RepoNotFoundErrorSchema,
  RepoOwnerNotActivatedErrorSchema,
} from 'services/repo'
import Api from 'shared/api'
import { rejectNetworkError } from 'shared/api/helpers'
import { mapEdges } from 'shared/utils/graphql'
import A from 'ui/A'

const PageInfoSchema = z.object({
  hasNextPage: z.boolean(),
  endCursor: z.string().nullable(),
})

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
  routes: z.array(z.string()).nullable(),
  extension: z.string(),
  bundleData: BundleDataSchema,
  measurements: AssetMeasurementsSchema.nullable(),
})

const BundleAssetPaginatedSchema = z.object({
  edges: z.array(z.object({ node: BundleAssetSchema })),
  pageInfo: PageInfoSchema,
})

const BundleInfoSchema = z.object({
  pluginName: z.string(),
})

const BundleAnalysisReportSchema = z.object({
  __typename: z.literal('BundleAnalysisReport'),
  bundle: z
    .object({
      info: BundleInfoSchema.nullable(),
      bundleData: z.object({
        size: z.object({
          uncompress: z.number(),
        }),
      }),
      assetsPaginated: BundleAssetPaginatedSchema.nullable(),
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
query BundleAssets(
  $owner: String!
  $repo: String!
  $branch: String!
  $bundle: String!
  $interval: MeasurementInterval!
  $dateBefore: DateTime!
  $dateAfter: DateTime
  $filters: BundleAnalysisReportFilters
  $assetsAfter: String
  $orderingDirection: OrderingDirection
  $ordering: AssetOrdering
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
                    info {
                      pluginName
                    }
                    bundleData {
                      size {
                        uncompress
                      }
                    }
                    assetsPaginated(
                      first: 20
                      after: $assetsAfter
                      orderingDirection: $orderingDirection
                      ordering: $ordering
                    ) {
                      edges {
                        node {
                          name
                          routes
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
                            before: $dateBefore
                            after: $dateAfter
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
                      pageInfo {
                        hasNextPage
                        endCursor
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

interface BundleAssetQueryOptsArgs {
  provider: string
  owner: string
  repo: string
  branch: string
  bundle: string
  interval?: 'INTERVAL_1_DAY' | 'INTERVAL_7_DAY' | 'INTERVAL_30_DAY'
  dateBefore?: Date
  dateAfter?: Date | null
  filters?: {
    reportGroups?: string[]
    loadTypes?: string[]
  }
  orderingDirection?: OrderingDirection
  ordering?: 'NAME' | 'SIZE' | 'TYPE'
}

export const BundleAssetsQueryOpts = ({
  provider,
  owner,
  repo,
  branch,
  bundle,
  interval,
  dateBefore,
  dateAfter,
  filters = {},
  orderingDirection,
  ordering,
}: BundleAssetQueryOptsArgs) =>
  infiniteQueryOptionsV5({
    queryKey: [
      'BundleAssets',
      provider,
      owner,
      repo,
      branch,
      bundle,
      interval,
      dateBefore,
      dateAfter,
      filters,
      ordering,
      orderingDirection,
    ],
    queryFn: ({ signal, pageParam }) => {
      const assetsAfter = pageParam ? pageParam : undefined

      return Api.graphql({
        query,
        provider,
        signal,
        variables: {
          owner,
          repo,
          branch,
          bundle,
          interval,
          dateBefore,
          dateAfter,
          filters,
          assetsAfter,
          ordering,
          orderingDirection,
        },
      }).then((res) => {
        const parsedData = RequestSchema.safeParse(res?.data)

        if (!parsedData.success) {
          return rejectNetworkError({
            status: 404,
            data: {},
            dev: 'BundleAssetsQueryOpts - 404 schema parsing failed',
            error: parsedData.error,
          })
        }

        const data = parsedData.data

        if (data?.owner?.repository?.__typename === 'NotFoundError') {
          return rejectNetworkError({
            status: 404,
            data: {},
            dev: 'BundleAssetsQueryOpts - 404 Repository not found',
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
            dev: 'BundleAssetsQueryOpts - 403 Owner not activated',
          })
        }

        if (
          !data?.owner ||
          data?.owner?.repository?.branch?.head?.bundleAnalysis
            ?.bundleAnalysisReport?.__typename === 'MissingHeadReport'
        ) {
          return {
            assets: [],
            bundleInfo: null,
            bundleData: null,
            pageInfo: null,
          }
        }

        const assets = mapEdges(
          data?.owner?.repository?.branch?.head?.bundleAnalysis
            ?.bundleAnalysisReport?.bundle?.assetsPaginated
        )
        const bundleData =
          data?.owner?.repository?.branch?.head?.bundleAnalysis
            ?.bundleAnalysisReport?.bundle?.bundleData
        const bundleInfo =
          data?.owner?.repository?.branch?.head?.bundleAnalysis
            ?.bundleAnalysisReport?.bundle?.info
        const pageInfo =
          data?.owner?.repository?.branch?.head?.bundleAnalysis
            ?.bundleAnalysisReport?.bundle?.assetsPaginated?.pageInfo ?? null

        return {
          assets,
          bundleData,
          bundleInfo,
          pageInfo,
        }
      })
    },
    // We have to set this as an empty string, because the type for pageParam
    // matches the type for initialPageParam.
    initialPageParam: '',
    getNextPageParam: (data) => {
      return data?.pageInfo?.hasNextPage ? data?.pageInfo?.endCursor : undefined
    },
  })
