import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'

import Api from 'shared/api'
import { NetworkErrorObject } from 'shared/api/helpers'
import A from 'ui/A'

import {
  RepoNotFoundErrorSchema,
  RepoOwnerNotActivatedErrorSchema,
} from './schemas'

const RepositorySchema = z.object({
  __typename: z.literal('Repository'),
  private: z.boolean().nullable(),
  uploadToken: z.string().nullable(),
  defaultBranch: z.string().nullable(),
  yaml: z.string().nullable(),
  activated: z.boolean(),
  oldestCommitAt: z.string().nullable(),
  active: z.boolean(),
})

export const RepoSchema = z.object({
  owner: z
    .object({
      isAdmin: z.boolean().nullable(),
      isCurrentUserPartOfOrg: z.boolean(),
      isCurrentUserActivated: z.boolean().nullable(),
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
    query GetRepo($owner: String!, $repo: String!){
      owner(username:$owner){
        isAdmin
        isCurrentUserPartOfOrg
        isCurrentUserActivated
        repository(name: $repo) {
          __typename
          ... on Repository {
            private
            uploadToken
            defaultBranch
            yaml
            activated
            oldestCommitAt
            active
          }
          ... on NotFoundError {
            message
          }
          ... on OwnerNotActivatedError {
            message
          }
        }
      }
    }
`

type UseRepoArgs = {
  provider: string
  owner: string
  repo: string
  opts?: {
    refetchOnWindowFocus?: boolean
  }
}

export function useRepo({ provider, owner, repo, opts = {} }: UseRepoArgs) {
  return useQuery({
    queryKey: ['GetRepo', provider, owner, repo],
    queryFn: ({ signal }) =>
      Api.graphql({
        provider,
        query,
        signal,
        variables: {
          owner,
          repo,
        },
      }).then((res) => {
        const parsedRes = RepoSchema.safeParse(res?.data)

        if (!parsedRes.success) {
          return Promise.reject({
            status: 404,
            data: {},
            dev: 'useRepo - 404 failed to parse',
          } satisfies NetworkErrorObject)
        }

        const { data } = parsedRes

        if (data?.owner?.repository?.__typename === 'NotFoundError') {
          return Promise.reject({
            status: 404,
            data: {},
            dev: 'useRepo - 404 NotFoundError',
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
            dev: 'useRepo - 403 OwnerNotActivatedError',
          } satisfies NetworkErrorObject)
        }

        return (
          {
            isAdmin: data?.owner?.isAdmin,
            repository: data?.owner?.repository,
            isCurrentUserPartOfOrg: data?.owner?.isCurrentUserPartOfOrg,
            isCurrentUserActivated: data?.owner?.isCurrentUserActivated,
          } ?? null
        )
      }),
    ...opts,
  })
}
