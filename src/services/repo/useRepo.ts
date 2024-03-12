import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'

import Api from 'shared/api'
import { NetworkErrorObject } from 'shared/api/helpers'

const RepositorySchema = z.object({
  private: z.boolean(),
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
      repository: RepositorySchema,
    })
    .nullable(),
})

const query = `
    query GetRepo($owner: String!, $repo: String!){
      owner(username:$owner){
        isAdmin
        isCurrentUserPartOfOrg
        isCurrentUserActivated
        repository: repositoryDeprecated(name:$repo){
          private
          uploadToken
          defaultBranch
          yaml
          activated
          oldestCommitAt
          active
        }
      }
    }
`

export interface UseRepoArgs {
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

        return {
          isAdmin: parsedRes?.data?.owner?.isAdmin,
          repository: parsedRes?.data?.owner?.repository,
          isCurrentUserPartOfOrg:
            parsedRes?.data?.owner?.isCurrentUserPartOfOrg,
          isCurrentUserActivated:
            parsedRes?.data?.owner?.isCurrentUserActivated,
        }
      }),
    ...opts,
  })
}
