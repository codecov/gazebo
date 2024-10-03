import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { z } from 'zod'

import Api from 'shared/api'
import { NetworkErrorObject } from 'shared/api/helpers'
import A from 'ui/A'

import {
  RepoNotFoundErrorSchema,
  RepoOwnerNotActivatedErrorSchema,
} from './schemas'

const query = `
query BackfillFlagMemberships($name: String!, $repo: String!) {
  config {
    isTimescaleEnabled
  }
  owner(username:$name) {
    repository(name:$repo) {
      __typename
      ... on Repository {
        coverageAnalytics {
          flagsMeasurementsActive
          flagsMeasurementsBackfilled
          flagsCount
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
}
`

const RepositorySchema = z.object({
  __typename: z.literal('Repository'),
  coverageAnalytics: z
    .object({
      flagsMeasurementsActive: z.boolean().nullish(),
      flagsMeasurementsBackfilled: z.boolean().nullish(),
      flagsCount: z.number().nullish(),
    })
    .nullable(),
})

const RepoBackfilledSchema = z.object({
  config: z
    .object({
      isTimescaleEnabled: z.boolean().nullish(),
    })
    .nullish(),
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

interface URLParams {
  provider: string
  owner: string
  repo: string
}

export function useRepoBackfilled() {
  const { provider, owner, repo } = useParams<URLParams>()
  return useQuery({
    queryKey: ['BackfillFlagMemberships', provider, owner, repo],
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
        const parsedRes = RepoBackfilledSchema.safeParse(res?.data)

        if (!parsedRes.success) {
          return Promise.reject({
            status: 404,
            data: {},
            dev: 'useRepoBackfilled - 404 Not Found Error',
          } satisfies NetworkErrorObject)
        }

        const data = parsedRes.data

        if (data?.owner?.repository?.__typename === 'NotFoundError') {
          return Promise.reject({
            status: 404,
            data: {},
            dev: 'useRepoBackfilled - 404 not found error',
          } satisfies NetworkErrorObject)
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
            dev: 'useRepoBackfilled - 403 owner not activated error',
          })
        }

        return {
          ...data?.config,
          ...data?.owner?.repository?.coverageAnalytics,
        }
      }),
  })
}
