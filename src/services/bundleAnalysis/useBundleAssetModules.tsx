import { useQuery } from '@tanstack/react-query'
import isNull from 'lodash/isNull'
import { z } from 'zod'

import { MissingHeadReportSchema } from 'services/comparison'
import {
  RepoNotFoundErrorSchema,
  RepoOwnerNotActivatedErrorSchema,
} from 'services/repo'
import Api from 'shared/api'
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
      ... on NotFoundError {
        message
      }
      ... on OwnerNotActivatedError {
        message
      }
    }
  }
}`

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
  return useQuery({
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
          return Promise.reject({
            status: 404,
            data: {},
          })
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

        let modules: Array<BundleAssetModule> = []
        const bundleReport =
          data?.owner?.repository?.branch?.head?.bundleAnalysisReport
        if (
          bundleReport?.__typename === 'BundleAnalysisReport' &&
          !isNull(bundleReport.bundle) &&
          !isNull(bundleReport.bundle.asset)
        ) {
          modules = bundleReport.bundle.asset.modules
        }

        return { modules }
      }),
  })
}
