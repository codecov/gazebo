import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { z } from 'zod'

import Api from 'shared/api'
import { rejectNetworkError } from 'shared/api/rejectNetworkError'

import { RepoNotFoundErrorSchema } from './schemas/RepoNotFoundError'

const RepositorySchema = z.object({
  __typename: z.literal('Repository'),
  private: z.boolean().nullable(),
  activated: z.boolean().nullable(),
  uploadToken: z.string().nullable(),
  defaultBranch: z.string().nullable(),
  graphToken: z.string().nullable(),
  yaml: z.string().nullable(),
  bot: z
    .object({
      username: z.string().nullable(),
    })
    .nullable(),
})

const RequestSchema = z.object({
  owner: z
    .object({
      isCurrentUserPartOfOrg: z.boolean().nullable(),
      repository: z
        .discriminatedUnion('__typename', [
          RepositorySchema,
          RepoNotFoundErrorSchema,
        ])
        .nullable(),
    })
    .nullable(),
})

const query = `
query GetRepoSettingsTeam($name: String!, $repo: String!) {
  owner(username:$name) {
    isCurrentUserPartOfOrg
    repository(name:$repo) {
      __typename
      ... on Repository {
        private
        activated
        uploadToken
        defaultBranch
        graphToken
        yaml
        bot {
          username
        }
      }
      ... on NotFoundError {
        message
      }
    }
  }
}`

interface URLParams {
  provider: string
  owner: string
  repo: string
}

export function useRepoSettingsTeam() {
  const { provider, owner, repo } = useParams<URLParams>()

  return useQuery({
    queryKey: ['GetRepoSettingsTeam', provider, owner, repo],
    queryFn: ({ signal }) =>
      Api.graphql({
        provider,
        query,
        signal,
        variables: {
          name: owner,
          repo,
        },
      }).then((res) => {
        const callingFn = 'useRepoSettingsTeam'
        const parsedRes = RequestSchema.safeParse(res?.data)

        if (!parsedRes.success) {
          return rejectNetworkError({
            errorName: 'Parsing Error',
            errorDetails: { callingFn, error: parsedRes.error },
          })
        }

        const data = parsedRes.data

        if (data?.owner?.repository?.__typename === 'NotFoundError') {
          return rejectNetworkError({
            errorName: 'Not Found Error',
            errorDetails: { callingFn },
          })
        }

        const repository = data.owner?.repository

        return {
          repository,
          isCurrentUserPartOfOrg: data?.owner?.isCurrentUserPartOfOrg,
        }
      }),
  })
}
