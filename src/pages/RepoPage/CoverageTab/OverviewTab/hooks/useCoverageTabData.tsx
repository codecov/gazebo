import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'

import {
  RepoNotFoundErrorSchema,
  RepoOwnerNotActivatedErrorSchema,
  useRepoOverview,
} from 'services/repo'
import Api from 'shared/api'
import { type NetworkErrorObject } from 'shared/api/helpers'
import A from 'ui/A'

const BranchSchema = z
  .object({
    head: z
      .object({
        coverageAnalytics: z.object({
          totals: z
            .object({
              fileCount: z.number().nullable(),
            })
            .nullable(),
        }),
      })
      .nullable(),
  })
  .nullable()

const GetBranchSchema = z.object({
  owner: z
    .object({
      repository: z
        .discriminatedUnion('__typename', [
          z.object({
            __typename: z.literal('Repository'),
            branch: BranchSchema,
          }),
          RepoNotFoundErrorSchema,
          RepoOwnerNotActivatedErrorSchema,
        ])
        .nullable(),
    })
    .nullable(),
})

const query = `
query CoverageTabData($owner: String!, $repo: String!, $branch: String!) {
  owner(username: $owner) {
    repository(name: $repo) {
      __typename
      ... on Repository {
        branch(name: $branch) {
          head {
            coverageAnalytics {
              totals {
                fileCount
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

interface UseCoverageTabDataArgs {
  provider: string
  owner: string
  repo: string
  branch?: string
}

export const useCoverageTabData = ({
  provider,
  owner,
  repo,
  branch,
}: UseCoverageTabDataArgs) => {
  const { data: repoOverview } = useRepoOverview({
    provider,
    repo,
    owner,
    opts: {
      enabled: !branch,
    },
  })

  const passedBranch = branch ?? repoOverview?.defaultBranch

  return useQuery({
    queryKey: ['CoverageTabData', provider, owner, repo, passedBranch, query],
    queryFn: ({ signal }) =>
      Api.graphql({
        provider,
        query,
        signal,
        variables: {
          owner,
          repo,
          branch: passedBranch,
        },
      }).then((res) => {
        const parsedData = GetBranchSchema.safeParse(res?.data)

        if (!parsedData.success) {
          return Promise.reject({
            status: 404,
            data: {},
            dev: 'useCoverageTabData - 404 schema parsing failed',
          } satisfies NetworkErrorObject)
        }

        const data = parsedData.data

        if (data?.owner?.repository?.__typename === 'NotFoundError') {
          return Promise.reject({
            status: 404,
            data: {},
            dev: 'useCoverageTabData - 404 NotFoundError',
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
            dev: 'useCoverageTabData - 403 OwnerNotActivatedError',
          } satisfies NetworkErrorObject)
        }

        return {
          branch: data?.owner?.repository?.branch ?? null,
        }
      }),
    enabled: !!passedBranch,
  })
}
