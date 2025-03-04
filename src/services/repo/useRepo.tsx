import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'

import Api from 'shared/api'
import { rejectNetworkError } from 'shared/api/rejectNetworkError'

import { RepoNotFoundErrorSchema } from './schemas/RepoNotFoundError'
import { RepoOwnerNotActivatedErrorSchema } from './schemas/RepoOwnerNotActivatedError'

const RepositorySchema = z.object({
  __typename: z.literal('Repository'),
  private: z.boolean().nullable(),
  uploadToken: z.string().nullable(),
  defaultBranch: z.string().nullable(),
  yaml: z.string().nullable(),
  activated: z.boolean(),
  oldestCommitAt: z.string().nullable(),
  active: z.boolean(),
  isFirstPullRequest: z.boolean(),
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
            isFirstPullRequest
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
        const callingFn = 'useRepo'
        const parsedRes = RepoSchema.safeParse(res?.data)

        if (!parsedRes.success) {
          return rejectNetworkError({
            errorName: 'Parsing Error',
            errorDetails: { callingFn, error: parsedRes.error },
          })
        }

        const { data } = parsedRes

        if (data?.owner?.repository?.__typename === 'NotFoundError') {
          return rejectNetworkError({
            errorName: 'Not Found Error',
            errorDetails: { callingFn },
          })
        }

        if (data?.owner?.repository?.__typename === 'OwnerNotActivatedError') {
          return {
            isCurrentUserActivated: false,
            repository: null,
            // OwnerNotActivated can only be returned if a repo is private and both
            // coverage and BA is enabled
            isRepoPrivate: true,
            isBundleAnalysisEnabled: true,
            isCoverageEnabled: true,
          }
        }

        return {
          isAdmin: data?.owner?.isAdmin,
          repository: data?.owner?.repository,
          isCurrentUserPartOfOrg: data?.owner?.isCurrentUserPartOfOrg,
          isCurrentUserActivated: data?.owner?.isCurrentUserActivated,
        }
      }),
    ...opts,
  })
}
