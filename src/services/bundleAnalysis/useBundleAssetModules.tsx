import {
  queryOptions as queryOptionsV5,
  useSuspenseQuery as useSuspenseQueryV5,
} from '@tanstack/react-queryV5'
import { z } from 'zod'

import { MissingHeadReportSchema } from 'services/comparison/schemas/MissingHeadReport'
import { RepoNotFoundErrorSchema } from 'services/repo/schemas/RepoNotFoundError'
import { RepoOwnerNotActivatedErrorSchema } from 'services/repo/schemas/RepoOwnerNotActivatedError'
import Api from 'shared/api'
import { rejectNetworkError } from 'shared/api/rejectNetworkError'
import A from 'ui/A'

const BundleAssetModuleSchema = z.object({
  name: z.string(),
  extension: z.string(),
  bundleData: z.object({
    loadTime: z.object({
      threeG: z.number(),
      highSpeed: z.number(),
    }),
    size: z.object({
      gzip: z.number(),
      uncompress: z.number(),
    }),
  }),
})

type BundleAssetModule = z.infer<typeof BundleAssetModuleSchema>

const BundleAnalysisReportSchema = z.object({
  __typename: z.literal('BundleAnalysisReport'),
  bundle: z
    .object({
      asset: z
        .object({
          modules: z.array(BundleAssetModuleSchema),
        })
        .nullable(),
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
query BundleAssetModules(
  $owner: String!
  $repo: String!
  $branch: String!
  $bundle: String!
  $asset: String!
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
                    asset(name: $asset) {
                      modules {
                        name
                        extension
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

interface BundleAssetModulesQueryOptsArgs {
  provider: string
  owner: string
  repo: string
  branch: string
  bundle: string
  asset: string
}

export const BundleAssetModulesQueryOpts = ({
  provider,
  owner,
  repo,
  branch,
  bundle,
  asset,
}: BundleAssetModulesQueryOptsArgs) => {
  return queryOptionsV5({
    queryKey: [
      'BundleAssetModules',
      provider,
      owner,
      repo,
      branch,
      bundle,
      asset,
    ],
    queryFn: ({ signal }) =>
      Api.graphql({
        provider,
        query,
        signal,
        variables: {
          owner,
          repo,
          branch,
          bundle,
          asset,
        },
      }).then((res) => {
        const parsedData = RequestSchema.safeParse(res.data)

        if (!parsedData.success) {
          return rejectNetworkError({
            errorName: 'Parsing Error',
            errorDetails: {
              callingFn: 'BundleAssetModulesQueryOpts',
              error: parsedData.error,
            },
          })
        }

        const data = parsedData.data

        if (data?.owner?.repository?.__typename === 'NotFoundError') {
          return rejectNetworkError({
            errorName: 'Not Found Error',
            errorDetails: { callingFn: 'BundleAssetModulesQueryOpts' },
          })
        }

        if (data?.owner?.repository?.__typename === 'OwnerNotActivatedError') {
          return rejectNetworkError({
            errorName: 'Owner Not Activated',
            errorDetails: { callingFn: 'BundleAssetModulesQueryOpts' },
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

        let modules: Array<BundleAssetModule> = []
        const bundleReport =
          data?.owner?.repository?.branch?.head?.bundleAnalysis
            ?.bundleAnalysisReport
        if (
          bundleReport?.__typename === 'BundleAnalysisReport' &&
          bundleReport.bundle !== null &&
          bundleReport.bundle.asset !== null
        ) {
          modules = bundleReport.bundle.asset.modules
        }

        return { modules }
      }),
  })
}

interface UseBundleAssetModulesArgs {
  provider: string
  owner: string
  repo: string
  branch: string
  bundle: string
  asset: string
}

export const useBundleAssetModules = ({
  provider,
  owner,
  repo,
  branch,
  bundle,
  asset,
}: UseBundleAssetModulesArgs) => {
  return useSuspenseQueryV5(
    BundleAssetModulesQueryOpts({
      provider,
      owner,
      repo,
      branch,
      bundle,
      asset,
    })
  )
}
