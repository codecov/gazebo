import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { z } from 'zod'

import Api from 'shared/api'
import { rejectNetworkError } from 'shared/api/rejectNetworkError'
import A from 'ui/A'

import { RepoNotFoundErrorSchema } from './schemas/RepoNotFoundError'
import { RepoOwnerNotActivatedErrorSchema } from './schemas/RepoOwnerNotActivatedError'

const RepositorySchema = z.object({
  __typename: z.literal('Repository'),
  private: z.boolean().nullable(),
  activated: z.boolean().nullable(),
  uploadToken: z.string().nullable(),
  defaultBranch: z.string().nullable(),
  staticAnalysisToken: z.string().nullable(),
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
query GetRepoSettings($name: String!, $repo: String!) {
  owner(username:$name){
    repository(name:$repo) {
      __typename
      ... on Repository {
        private
        activated
        uploadToken
        defaultBranch
        staticAnalysisToken
        graphToken
        yaml
        bot {
          username
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

interface URLParams {
  provider: string
  owner: string
  repo: string
}

export function useRepoSettings() {
  const { provider, owner, repo } = useParams<URLParams>()

  return useQuery({
    queryKey: ['GetRepoSettings', provider, owner, repo],
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
        const parsedRes = RequestSchema.safeParse(res?.data)

        if (!parsedRes.success) {
          return rejectNetworkError({
            errorName: 'Parsing Error',
            errorDetails: {
              callingFn: 'fetchRepoSettingsDetails',
              error: parsedRes.error,
            },
          })
        }

        const data = parsedRes.data

        if (data?.owner?.repository?.__typename === 'NotFoundError') {
          return rejectNetworkError({
            errorName: 'Not Found Error',
            errorDetails: {
              callingFn: 'fetchRepoSettingsDetails',
            },
          })
        }

        if (data?.owner?.repository?.__typename === 'OwnerNotActivatedError') {
          return rejectNetworkError({
            errorName: 'Owner Not Activated',
            errorDetails: {
              callingFn: 'fetchRepoSettingsDetails',
            },
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
          })
        }

        const repository = data.owner?.repository

        return {
          repository,
        }
      }),
  })
}
