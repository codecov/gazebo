import { queryOptions as queryOptionsV5 } from '@tanstack/react-queryV5'
import { z } from 'zod'

// import { BUNDLE_LOAD_TYPE_ITEMS } from 'pages/RepoPage/BundlesTab/BundleContent/constants'
import { MissingHeadReportSchema } from 'services/comparison'
import {
  RepoNotFoundErrorSchema,
  RepoOwnerNotActivatedErrorSchema,
} from 'services/repo'
import Api from 'shared/api'
import { rejectNetworkError } from 'shared/api/helpers'
import A from 'ui/A'

export const BUNDLE_TREND_INTERVALS = [
  'INTERVAL_1_DAY',
  'INTERVAL_7_DAY',
  'INTERVAL_30_DAY',
] as const

export const BUNDLE_TREND_REPORT_TYPES = [
  'REPORT_SIZE',
  'JAVASCRIPT_SIZE',
  'STYLESHEET_SIZE',
  'FONT_SIZE',
  'IMAGE_SIZE',
  'ASSET_SIZE',
  'UNKNOWN_SIZE',
] as const

const MeasurementSchema = z.object({
  timestamp: z.string(),
  avg: z.number().nullable(),
})

const BundleSchema = z.object({
  measurements: z
    .array(
      z.object({
        assetType: z.enum(BUNDLE_TREND_REPORT_TYPES),
        measurements: z.array(MeasurementSchema).nullable(),
      })
    )
    .nullable(),
})

const BundleReportSchema = z.object({
  __typename: z.literal('BundleAnalysisReport'),
  bundle: BundleSchema.nullable(),
})

const BranchSchema = z.object({
  head: z
    .object({
      bundleAnalysis: z
        .object({
          bundleAnalysisReport: z.discriminatedUnion('__typename', [
            BundleReportSchema,
            MissingHeadReportSchema,
          ]),
        })
        .nullable(),
    })
    .nullable(),
})

const RepositorySchema = z.object({
  __typename: z.literal('Repository'),
  branch: BranchSchema.nullable(),
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
query GetBundleTrend(
  $owner: String!
  $repo: String!
  $branch: String!
  $bundle: String!
  $interval: MeasurementInterval!
  $before: DateTime!
  $after: DateTime
  $filters: BundleAnalysisMeasurementsSetFilters
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
                  bundle(name: $bundle) {
                    measurements(
                      interval: $interval
                      before: $before
                      after: $after
                      filters: $filters
                    ) {
                      assetType
                      measurements {
                        timestamp
                        avg
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

interface BundleTrendDataQueryOptsArgs {
  provider: string
  owner: string
  repo: string
  branch: string
  bundle: string
  interval: (typeof BUNDLE_TREND_INTERVALS)[number]
  before: Date
  after: Date | null
  filters: {
    assetTypes: Array<(typeof BUNDLE_TREND_REPORT_TYPES)[number]>
    // temp removing while we don't have filtering by types implemented
    // loadTypes: Array<(typeof BUNDLE_LOAD_TYPE_ITEMS)[number]>
  }
}

export const BundleTrendDataQueryOpts = ({
  provider,
  owner,
  repo,
  branch,
  bundle,
  interval,
  before,
  after,
  filters,
}: BundleTrendDataQueryOptsArgs) =>
  queryOptionsV5({
    queryKey: [
      'GetBundleTrend',
      provider,
      owner,
      repo,
      branch,
      bundle,
      interval,
      before,
      after,
      filters,
    ],
    queryFn: ({ signal }) =>
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
          before,
          after,
          filters,
        },
      }).then((res) => {
        const parsedData = RequestSchema.safeParse(res?.data)

        if (!parsedData.success) {
          return rejectNetworkError({
            status: 404,
            data: {},
            dev: 'BundleTrendDataQueryOpts - 404 Failed to parse schema',
            error: parsedData.error,
          })
        }

        const data = parsedData.data

        if (data?.owner?.repository?.__typename === 'NotFoundError') {
          return rejectNetworkError({
            status: 404,
            data: {},
            dev: 'BundleTrendDataQueryOpts - 404 Not found error',
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
            dev: 'BundleTrendDataQueryOpts - 403 Owner not activated',
          })
        }

        const bundleReport =
          data.owner?.repository?.branch?.head?.bundleAnalysis
            ?.bundleAnalysisReport

        if (bundleReport?.__typename === 'BundleAnalysisReport') {
          return bundleReport?.bundle?.measurements
        }

        return []
      }),
  })
