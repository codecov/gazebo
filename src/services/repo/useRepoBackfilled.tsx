import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { z } from 'zod'

import Api from 'shared/api'
import { rejectNetworkError } from 'shared/api/rejectNetworkError'
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
        const callingFn = 'useRepoBackfilled'
        const parsedRes = RepoBackfilledSchema.safeParse(res?.data)

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

        return {
          ...data?.config,
          ...data?.owner?.repository?.coverageAnalytics,
        }
      }),
  })
}
