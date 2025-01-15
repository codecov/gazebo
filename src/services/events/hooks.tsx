import { queryOptions as queryOptionsV5 } from '@tanstack/react-queryV5'
import { z } from 'zod'

import {
  RepoNotFoundErrorSchema,
  RepoOwnerNotActivatedErrorSchema,
} from 'services/repo'
import Api from 'shared/api'
import { Provider, rejectNetworkError } from 'shared/api/helpers'
import A from 'ui/A'

const OwnerContextSchema = z.object({
  owner: z
    .object({
      ownerid: z.number().nullable(),
    })
    .nullable(),
})

const ownerContextQuery = `
  query OwnerContext($owner: String!) {
    owner(username: $owner) {
      ownerid
    }
  }
`

interface OwnerContextQueryOptsArgs {
  provider: Provider
  owner?: string
}

export const OwnerContextQueryOpts = ({
  provider,
  owner,
}: OwnerContextQueryOptsArgs) =>
  queryOptionsV5({
    queryKey: ['OwnerContext', provider, owner],
    queryFn: ({ signal }) =>
      Api.graphql({
        provider,
        query: ownerContextQuery,
        signal,
        variables: {
          owner,
        },
      }).then((res) => {
        const parsedRes = OwnerContextSchema.safeParse(res.data)

        console.log('aewsr')

        if (!parsedRes.success) {
          return rejectNetworkError({
            status: 404,
            data: {},
            dev: 'OwnerContextQueryOpts - 404 Failed to parse data',
          })
        }

        return parsedRes.data.owner
      }),
    enabled: !!owner,
    // Fetch this data only once per session
    staleTime: Infinity,
    gcTime: Infinity,
  })

const RepositorySchema = z.object({
  __typename: z.literal('Repository'),
  repoid: z.number(),
  private: z.boolean().nullable(),
})

const RepoContextSchema = z.object({
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

const repoContextQuery = `
  query RepoContext($owner: String!, $repo: String!) {
    owner(username: $owner) {
      repository(name: $repo) {
        __typename
        ... on Repository {
          repoid
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

interface RepoContextQueryOptsArgs {
  provider: Provider
  owner?: string
  repo?: string
}

export const RepoContextQueryOpts = ({
  provider,
  owner,
  repo,
}: RepoContextQueryOptsArgs) =>
  queryOptionsV5({
    queryKey: ['RepoContext', provider, owner, repo],
    queryFn: ({ signal }) =>
      Api.graphql({
        provider,
        query: repoContextQuery,
        signal,
        variables: {
          owner,
          repo,
        },
      }).then((res) => {
        const parsedRes = RepoContextSchema.safeParse(res.data)

        if (!parsedRes.success) {
          return rejectNetworkError({
            status: 404,
            data: {},
            dev: 'RepoContextQueryOpts - 404 Failed to parse data',
          })
        }

        if (parsedRes.data?.owner?.repository?.__typename === 'NotFoundError') {
          return rejectNetworkError({
            status: 404,
            data: {},
            dev: 'RepoContextQueryOpts - 404 NotFoundError',
          })
        }

        if (
          parsedRes.data?.owner?.repository?.__typename ===
          'OwnerNotActivatedError'
        ) {
          return rejectNetworkError({
            status: 403,
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
            dev: 'RepoContextQueryOpts - 404 OwnerNotActivatedError',
          })
        }

        return parsedRes.data.owner?.repository
      }),
    enabled: !!owner && !!repo,
    // Fetch this data only once per session
    staleTime: Infinity,
    gcTime: Infinity,
  })
