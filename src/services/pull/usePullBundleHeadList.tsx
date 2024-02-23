import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'

import {
  RepoNotFoundErrorSchema,
  RepoOwnerNotActivatedErrorSchema,
} from 'services/repo/schemas'
import Api from 'shared/api'
import A from 'ui/A'

const BundleSchema = z.object({
  name: z.string(),
  sizeTotal: z.number(),
  loadTimeTotal: z.number(),
})

const RepositorySchema = z.object({
  __typename: z.literal('Repository'),
  pull: z
    .object({
      head: z
        .object({
          bundleAnalysisReport: z
            .discriminatedUnion('__typename', [
              z.object({
                __typename: z.literal('BundleAnalysisReport'),
                bundles: z.array(BundleSchema),
              }),
              z.object({
                __typename: z.literal('MissingHeadReport'),
                message: z.string(),
              }),
            ])
            .nullable(),
        })
        .nullable(),
    })
    .nullable(),
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
query PullBundleHeadList($owner: String!, $repo: String!, $pullId: Int!) {
  owner(username: $owner) {
    repository(name: $repo) {
      __typename
      ... on Repository {
        pull(id: $pullId) {
          head {
            bundleAnalysisReport {
              __typename
              ... on BundleAnalysisReport {
                bundles {
                  name
                  sizeTotal
                  loadTimeTotal
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

interface UsePullBundleComparisonListArgs {
  provider: string
  owner: string
  repo: string
  pullId: number
}

export function usePullBundleHeadList({
  provider,
  owner,
  repo,
  pullId,
}: UsePullBundleComparisonListArgs) {
  return useQuery({
    queryKey: ['PullBundleHeadList', provider, owner, repo, pullId],
    queryFn: ({ signal }) =>
      Api.graphql({
        provider,
        query,
        signal,
        variables: {
          owner,
          repo,
          pullId,
        },
      }).then((res) => {
        const parsedRes = RequestSchema.safeParse(res?.data)

        if (!parsedRes.success) {
          return Promise.reject({
            status: 404,
            data: null,
          })
        }

        const data = parsedRes.data

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

        return {
          pull: data?.owner?.repository?.pull ?? null,
        }
      }),
  })
}
