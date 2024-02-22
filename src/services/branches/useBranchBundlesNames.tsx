import { useQuery } from '@tanstack/react-query'
import isString from 'lodash/isString'
import { z } from 'zod'

import { MissingHeadReportSchema } from 'services/comparison'
import {
  RepoNotFoundErrorSchema,
  RepoOwnerNotActivatedErrorSchema,
  useRepoOverview,
} from 'services/repo'
import Api from 'shared/api'
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
          bundleAnalysisReport: BundleReportSchema.nullable(),
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
      ... on NotFoundError {
        message
      }
      ... on OwnerNotActivatedError {
        message
      }
    }
  }
}`

interface UseBranchBundlesNamesArgs {
  provider: string
  owner: string
  repo: string
  branch?: string
  opts?: {
    enabled?: boolean
  }
}

export const useBranchBundlesNames = ({
  provider,
  owner,
  repo,
  branch: branchArg,
  opts = {},
}: UseBranchBundlesNamesArgs) => {
  const { data: repoOverview, isSuccess } = useRepoOverview({
    provider,
    repo,
    owner,
  })

  const branch = branchArg ?? repoOverview?.defaultBranch

  return useQuery({
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

        let bundles: Array<string> = []
        if (
          data?.owner?.repository?.branch?.head?.bundleAnalysisReport
            ?.__typename === 'BundleAnalysisReport'
        ) {
          bundles =
            data.owner.repository.branch.head.bundleAnalysisReport.bundles?.map(
              ({ name }) => name
            )
        }

        return { bundles }
      }),
    enabled: (isSuccess && isString(branch)) || opts?.enabled,
  })
}
