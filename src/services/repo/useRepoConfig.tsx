import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import { z } from 'zod'

import Api from 'shared/api'
import { rejectNetworkError } from 'shared/api/rejectNetworkError'
import A from 'ui/A'

import { RepoNotFoundErrorSchema } from './schemas/RepoNotFoundError'
import { RepoOwnerNotActivatedErrorSchema } from './schemas/RepoOwnerNotActivatedError'

const IndicationRangeSchema = z
  .object({
    lowerRange: z.number(),
    upperRange: z.number(),
  })
  .nullish()

export const RepositoryConfigSchema = z
  .object({
    indicationRange: IndicationRangeSchema,
  })
  .nullish()

const RepositorySchema = z.object({
  __typename: z.literal('Repository'),
  repositoryConfig: RepositoryConfigSchema,
})

const UseRepoConfigSchema = z.object({
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

type RepoConfigData = z.infer<typeof RepositoryConfigSchema>
export type IndicationRangeType = z.infer<typeof IndicationRangeSchema>

export interface UseRepoConfigArgs {
  provider: string
  owner: string
  repo: string
  opts?: UseQueryOptions<RepoConfigData>
}

const query = `
  query RepoConfig($owner: String!, $repo: String!) {
    owner(username:$owner) {
      repository(name:$repo) {
        __typename
        ... on Repository {
          repositoryConfig {
            indicationRange {
              lowerRange
              upperRange
            }
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

export const useRepoConfig = ({
  provider,
  owner,
  repo,
  opts,
}: UseRepoConfigArgs) =>
  useQuery({
    queryKey: ['RepoConfig', provider, owner, repo, query],
    queryFn: ({ signal }) =>
      Api.graphql({
        provider,
        query,
        signal,
        variables: {
          owner,
          repo,
        },
      }).then((res) => {
        const parsedRes = UseRepoConfigSchema.safeParse(res?.data)

        if (!parsedRes.success) {
          return rejectNetworkError({
            errorName: 'Parsing Error',
            errorDetails: {
              callingFn: 'useRepoConfig',
              error: parsedRes.error,
            },
          })
        }

        const data = parsedRes.data

        if (data?.owner?.repository?.__typename === 'NotFoundError') {
          return rejectNetworkError({
            errorName: 'Not Found Error',
            errorDetails: {
              callingFn: 'useRepoConfig',
            },
          })
        }

        if (data?.owner?.repository?.__typename === 'OwnerNotActivatedError') {
          return rejectNetworkError({
            errorName: 'Owner Not Activated',
            errorDetails: {
              callingFn: 'useRepoConfig',
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

        return res?.data?.owner?.repository?.repositoryConfig ?? {}
      }),
    ...(!!opts && opts),
  })
