import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { z } from 'zod'

import {
  RepoNotFoundErrorSchema,
  RepoOwnerNotActivatedErrorSchema,
} from 'services/repo'
import Api from 'shared/api'
import { NetworkErrorObject } from 'shared/api/helpers'
import A from 'ui/A'

const SelfHostedSettingsSchema = z.object({
  planAutoActivate: z.boolean().nullable(),
  seatsLimit: z.number().nullable(),
  seatsUsed: z.number().nullable(),
})

export type SelfHostedSettings = z.infer<typeof SelfHostedSettingsSchema>

const RepositorySchema = z
  .object({
    __typename: z.literal('Repository'),
  })
  .merge(SelfHostedSettingsSchema)

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
  query SelfHostedSettings($owner: String!, $repo: String!) {
    owner(username: $owner) {
      repository(name: $repo) {
        __typename
        ... on Repository {
          seatsLimit
          seatsUsed
          planAutoActivate
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

interface URLParams {
  provider: string
  owner: string
  repo: string
}

export const useSelfHostedSettings = () => {
  const { provider, owner, repo } = useParams<URLParams>()
  return useQuery({
    queryKey: ['SelfHostedSettings', provider, owner, repo, query],
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
        const parsedData = RequestSchema.safeParse(res?.data)

        if (!parsedData.success) {
          return Promise.reject({
            status: 404,
            data: {},
            dev: 'useSelfHostedSettings - 404 schema parsing failed',
          } satisfies NetworkErrorObject)
        }

        const { data } = parsedData

        if (data?.owner?.repository?.__typename === 'NotFoundError') {
          return Promise.reject({
            status: 404,
            data: {},
            dev: 'useSelfHostedSettings - 404 NotFoundError',
          } satisfies NetworkErrorObject)
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
            dev: 'useSelfHostedSettings - 403 OwnerNotActivatedError',
          } satisfies NetworkErrorObject)
        }

        return parsedData.data.owner?.repository
      }),
  })
}
