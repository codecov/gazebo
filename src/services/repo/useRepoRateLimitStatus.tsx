import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'

import Api from 'shared/api'

import {
  RepoNotFoundErrorSchema,
  RepoOwnerNotActivatedErrorSchema,
} from './schemas'

const RepositorySchema = z.object({
  __typename: z.literal('Repository'),
  isGithubRateLimited: z.boolean().nullable(),
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

const query = `query GetRepoRateLimitStatus($owner: String!, $repo: String!) {
  owner(username: $owner) {
    repository(name: $repo) {
      __typename
      ... on Repository {
        isGithubRateLimited
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

interface UseRepoRateLimitStatusArgs {
  provider: string
  owner: string
  repo: string
}

export function useRepoRateLimitStatus({
  provider,
  owner,
  repo,
}: UseRepoRateLimitStatusArgs) {
  return useQuery({
    queryKey: ['GetRepoRateLimitStatus', provider, owner, repo],
    queryFn: ({ signal }) => {
      return Api.graphql({
        provider,
        signal,
        query,
        variables: {
          owner,
          repo,
        },
      }).then((res) => {
        const parsedData = RequestSchema.safeParse(res?.data)
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
          return null
        }

        if (!data?.owner?.repository) {
          return null
        }

        return {
          isGithubRateLimited: data.owner.repository.isGithubRateLimited,
        }
      })
    },
  })
}
