import { queryOptions as queryOptionsV5 } from '@tanstack/react-queryV5'
import { z } from 'zod'

import {
  RepoNotFoundErrorSchema,
  RepoOwnerNotActivatedErrorSchema,
} from 'services/repo'
import Api from 'shared/api'
import { rejectNetworkError } from 'shared/api/rejectNetworkError'
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
}`

interface RepoForTokensTeamQueryArgs {
  provider: string
  owner: string
  repo: string
}

export const RepoForTokensTeamQueryOpts = ({
  provider,
  owner,
  repo,
}: RepoForTokensTeamQueryArgs) =>
  queryOptionsV5({
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
        const callingFn = 'RepoForTokensTeamQueryOpts'
        const parsedData = GetRepoDataSchema.safeParse(res?.data)

        if (!parsedData.success) {
          return rejectNetworkError({
            errorName: 'Parsing Error',
            errorDetails: { callingFn, error: parsedData.error },
          })
        }

        const { data } = parsedData

        if (data?.owner?.repository?.__typename === 'NotFoundError') {
          return rejectNetworkError({
            errorName: 'Not Found Error',
            errorDetails: { callingFn },
          })
        }

        if (data?.owner?.repository?.__typename === 'OwnerNotActivatedError') {
          return rejectNetworkError({
            errorName: 'Owner Not Activated',
            errorDetails: { callingFn },
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

        return data?.owner?.repository ?? null
      }),
  })
