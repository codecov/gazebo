import { useInfiniteQuery } from '@tanstack/react-query'
import { z } from 'zod'

import { MissingHeadReportSchema } from 'services/comparison'
import {
  RepoNotFoundErrorSchema,
  RepoOwnerNotActivatedErrorSchema,
} from 'services/repo'
import Api from 'shared/api'
import { type NetworkErrorObject } from 'shared/api/helpers'
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
  extension: z.string(),
  bundleData: BundleDataSchema,
  measurements: AssetMeasurementsSchema.nullable(),
})

const BundleAssetPaginatedSchema = z.object({
  edges: z.array(z.object({ node: BundleAssetSchema })),
  pageInfo: PageInfoSchema,
})

const BundleAnalysisReportSchema = z.object({
  __typename: z.literal('BundleAnalysisReport'),
  bundle: z
    .object({
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
query PagedBundleAssets(
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
            bundleAnalysisReport {
              __typename
              ... on BundleAnalysisReport {
                bundle(name: $bundle, filters: $filters) {
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
      ... on NotFoundError {
        message
      }
      ... on OwnerNotActivatedError {
        message
      }
    }
  }
}`

interface UsePagedBundleAssetsArgs {
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
  orderingDirection?: 'ASC' | 'DESC'
  ordering?: 'NAME' | 'SIZE' | 'TYPE'
  opts?: {
    enabled?: boolean
    suspense?: boolean
  }
}

export const usePagedBundleAssets = ({
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
  opts,
}: UsePagedBundleAssetsArgs) => {
  const { data, ...rest } = useInfiniteQuery({
    queryKey: [
      'PagedBundleAssets',
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
    queryFn: ({ signal, pageParam }) =>
      Api.graphql({
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
          assetsAfter: pageParam,
          ordering,
          orderingDirection,
        },
      }).then((res) => {
        const parsedData = RequestSchema.safeParse(res?.data)

        if (!parsedData.success) {
          return Promise.reject({
            status: 404,
            data: {},
            dev: 'usePagedBundleAssets - 404 schema parsing failed',
          } satisfies NetworkErrorObject)
        }

        const data = parsedData.data

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

        if (
          !data?.owner ||
          data?.owner?.repository?.branch?.head?.bundleAnalysisReport
            ?.__typename === 'MissingHeadReport'
        ) {
          return {
            assets: [],
            bundleData: null,
            pageInfo: null,
          }
        }

        const assets = mapEdges(
          data?.owner?.repository?.branch?.head?.bundleAnalysisReport?.bundle
            ?.assetsPaginated
        )

        return {
          assets,
          bundleData:
            data?.owner?.repository?.branch?.head?.bundleAnalysisReport?.bundle
              ?.bundleData,
          pageInfo:
            data?.owner?.repository?.branch?.head?.bundleAnalysisReport?.bundle
              ?.assetsPaginated?.pageInfo ?? null,
        }
      }),
    getNextPageParam: (data) => {
      return data?.pageInfo?.hasNextPage ? data?.pageInfo?.endCursor : undefined
    },
    enabled: opts?.enabled !== undefined ? opts.enabled : true,
    suspense: !!opts?.suspense,
  })

  return {
    data: {
      assets: data?.pages.map((page) => page.assets).flat() ?? [],
      bundleData: data?.pages?.[0]?.bundleData ?? null,
    },
    ...rest,
  }
}
