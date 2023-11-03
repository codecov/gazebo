import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'

import {
  RepoNotFoundErrorSchema,
  RepoOwnerNotActivatedErrorSchema,
} from 'services/repo'
import Api from 'shared/api'
import A from 'ui/A'

const RepositorySchema = z.object({
  __typename: z.literal('Repository'),
  defaultBranch: z.string().nullable(),
  private: z.boolean().nullable(),
})

const GetRepoDataSchema = z.object({
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

export type RepoDataTokensTeam = z.infer<typeof GetRepoDataSchema>

const query = `
  query RepoDataTokensTeam($owner: String!, $repo: String!) {
    owner(username: $owner) {
      repository(name: $repo) {
        __typename
        ... on Repository {
          defaultBranch
          private
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

interface RepoDataTokensArgs {
  provider: string
  owner: string
  repo: string
}

export const useRepoForTokensTeam = ({
  provider,
  owner,
  repo,
}: RepoDataTokensArgs) =>
  useQuery({
    queryKey: ['RepoDataTokensTeam', provider, owner, repo, query],
    queryFn: ({ signal }) =>
      Api.graphql({
        provider,
        query,
        signal,
        variables: {
          provider,
          owner,
          repo,
        },
      }).then((res) => {
        const parsedData = GetRepoDataSchema.safeParse(res?.data)

        if (!parsedData.success) {
          return Promise.reject({
            status: 404,
            data: {},
          })
        }

        const { data } = parsedData

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

        return data?.owner?.repository ?? null
      }),
  })
