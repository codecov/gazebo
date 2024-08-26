import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { z } from 'zod'

import Api from 'shared/api'
import { NetworkErrorObject } from 'shared/api/helpers'

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

interface FetchRepoSettingsTeamArgs {
  provider: string
  owner: string
  repo: string
  signal?: AbortSignal
}

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

function fetchRepoSettingsDetails({
  provider,
  owner,
  repo,
  signal,
}: FetchRepoSettingsTeamArgs) {
  return Api.graphql({
    provider,
    query,
    signal,
    variables: {
      name: owner,
      repo,
    },
  }).then((res) => {
    const parsedRes = RequestSchema.safeParse(res?.data)

    if (!parsedRes.success) {
      return Promise.reject({
        status: 404,
        data: {},
        dev: 'useRepoSettingsTeam - 404 schema parsing failed',
      } satisfies NetworkErrorObject)
    }

    const data = parsedRes.data

    if (data?.owner?.repository?.__typename === 'NotFoundError') {
      return Promise.reject({
        status: 404,
        data: {},
        dev: 'useRepoSettingsTeam - 404 not found error',
      })
    }

    const repository = data.owner?.repository

    return {
      repository,
      isCurrentUserPartOfOrg: data?.owner?.isCurrentUserPartOfOrg,
    }
  })
}

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
      fetchRepoSettingsDetails({ provider, owner, repo, signal }),
  })
}
