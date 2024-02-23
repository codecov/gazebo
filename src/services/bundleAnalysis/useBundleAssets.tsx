import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'

import { MissingHeadReportSchema } from 'services/comparison'
import {
  RepoNotFoundErrorSchema,
  RepoOwnerNotActivatedErrorSchema,
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
    uncompress: z.number(),
    gzip: z.number(),
  }),
})

const BundleAssetSchema = z.object({
  name: z.string(),
  extension: z.string(),
  bundleData: BundleDataSchema,
})

type BundleAsset = z.infer<typeof BundleAssetSchema>

const BundleAnalysisReportSchema = z.object({
  __typename: z.literal('BundleAnalysisReport'),
  bundle: z.object({
    assets: z.array(BundleAssetSchema),
  }),
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
  branch: string
  bundle: string
}

export const useBundleAssets = ({
  provider,
  owner,
  repo,
  branch,
  bundle,
}: UseBundleAssetsArgs) => {
  return useQuery({
    queryKey: ['BundleAssets', provider, owner, repo, branch, bundle],
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
        if (
          data?.owner?.repository?.branch?.head?.bundleAnalysisReport
            ?.__typename === 'BundleAnalysisReport'
        ) {
          assets =
            data.owner.repository.branch.head.bundleAnalysisReport.bundle.assets
        }

        return { assets }
      }),
  })
}
