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
  isATSConfigured: z.boolean().nullable(),
  primaryLanguage: z.string().nullable(),
})

const GetRepoATSDataSchema = z.object({
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

export type RepoATSInfo = z.infer<typeof GetRepoATSDataSchema>

const query = `
  query RepoATSInfo($owner: String!, $repo: String!) {
    owner(username: $owner) {
      repository(name: $repo) {
        __typename
        ... on Repository {
          isATSConfigured
          primaryLanguage
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

interface RepoATSInfoArgs {
  provider: string
  owner: string
  repo: string
}

export const useRepoATS = ({ provider, owner, repo }: RepoATSInfoArgs) =>
  useQuery({
    queryKey: ['RepoATSInfo', provider, owner, repo, query],
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
        const parsedData = GetRepoATSDataSchema.safeParse(res?.data)

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
                  <A
                    to={{ pageName: 'membersTab' }}
                    hook="activate-user"
                    isExternal={false}
                  >
                    click here{' '}
                  </A>{' '}
                  to activate your account.
                </p>
              ),
            },
          })
        }

        return data?.owner?.repository ?? null
      }),
  })



