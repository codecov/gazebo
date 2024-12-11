import { useQuery, UseQueryOptions } from '@tanstack/react-query'
import { z } from 'zod'

import {
  RepoNotFoundErrorSchema,
  RepoOwnerNotActivatedErrorSchema,
} from 'services/repo'
import Api from 'shared/api'
import { type NetworkErrorObject } from 'shared/api/helpers'
import A from 'ui/A'

export const BranchSchema = z
  .object({
    name: z.string(),
    head: z
      .object({
        commitid: z.string(),
      })
      .nullable(),
  })
  .nullable()

type BranchData = z.infer<typeof BranchSchema>

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

export interface UseBranchArgs {
  provider: string
  owner: string
  repo: string
  branch: string
  opts?: UseQueryOptions<{ branch: BranchData }>
}

export const query = `
query GetBranch($owner: String!, $repo: String!, $branch: String!) {
  owner(username: $owner) {
    repository(name: $repo) {
      __typename
      ... on Repository {
        branch(name: $branch) {
          name
          head {
            commitid
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

export const useBranch = ({
  provider,
  owner,
  repo,
  branch,
  opts,
}: UseBranchArgs) =>
  useQuery({
    queryKey: ['GetBranch', provider, owner, repo, branch, query],
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
        const parsedData = GetBranchSchema.safeParse(res?.data)

        if (!parsedData.success) {
          return Promise.reject({
            status: 404,
            data: {},
            dev: 'useBranch - 404 schema parsing failed',
          } satisfies NetworkErrorObject)
        }

        const data = parsedData.data

        if (data?.owner?.repository?.__typename === 'NotFoundError') {
          return Promise.reject({
            status: 404,
            data: {},
            dev: 'useBranch - 404 NotFoundError',
          } satisfies NetworkErrorObject)
        }

        if (data?.owner?.repository?.__typename === 'OwnerNotActivatedError') {
          return Promise.reject({
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
            dev: 'useBranch - 403 OwnerNotActivatedError',
          } satisfies NetworkErrorObject)
        }

        return {
          branch: data?.owner?.repository?.branch ?? null,
        }
      }),
    ...(!!opts && opts),
  })
