import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'

import {
  RepoNotFoundErrorSchema,
  RepoOwnerNotActivatedErrorSchema,
} from 'services/repo'
import { TierNames } from 'services/tier'
import Api from 'shared/api/api'
import { NetworkErrorObject } from 'shared/api/helpers'
import A from 'ui/A'

const RepositorySchema = z.object({
  __typename: z.literal('Repository'),
  flagsCount: z.number(),
  componentsCount: z.number(),
  coverageEnabled: z.boolean().nullable(),
  bundleAnalysisEnabled: z.boolean().nullable(),
  testAnalyticsEnabled: z.boolean().nullable(),
  yaml: z.string().nullable(),
  languages: z.array(z.string()).nullable(),
})

const PlanSchema = z
  .object({
    tierName: z.nativeEnum(TierNames),
  })
  .nullable()

export type RepositoryConfiguration =
  | {
      plan: z.infer<typeof PlanSchema>
      repository: z.infer<typeof RepositorySchema> | null
    }
  | undefined

const RequestSchema = z.object({
  owner: z
    .object({
      plan: PlanSchema,
      repository: z.discriminatedUnion('__typename', [
        RepositorySchema,
        RepoNotFoundErrorSchema,
        RepoOwnerNotActivatedErrorSchema,
      ]),
    })
    .nullable(),
})

const query = `query GetRepoConfigurationStatus($owner: String!, $repo: String!){
  owner(username: $owner) {
    plan {
      tierName
    }
    repository(name:$repo) {
      __typename
      ... on Repository {
        flagsCount
        componentsCount
        coverageEnabled
        bundleAnalysisEnabled
        testAnalyticsEnabled
        yaml
        languages
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

interface UseRepoConfigurationStatusArgs {
  provider: string
  owner: string
  repo: string
}

export function useRepoConfigurationStatus({
  provider,
  owner,
  repo,
}: UseRepoConfigurationStatusArgs) {
  return useQuery({
    queryKey: ['GetRepoConfigurationStatus', provider, owner, repo],
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
        const parsedRes = RequestSchema.safeParse(res?.data)

        if (!parsedRes.success) {
          return Promise.reject({
            status: 404,
            data: {},
            dev: 'useRepoConfigurationStatus - 404 Failed to parse data',
          } satisfies NetworkErrorObject)
        }

        const data = parsedRes.data

        if (data?.owner?.repository?.__typename === 'NotFoundError') {
          return Promise.reject({
            status: 404,
            data: {},
            dev: 'useRepoConfigurationStatus - 404 Not found error',
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
            dev: 'useRepoConfigurationStatus - 403 Owner not activated error',
          } satisfies NetworkErrorObject)
        }

        return {
          plan: data?.owner?.plan ?? null,
          repository: data?.owner?.repository ?? null,
        }
      })
    },
  })
}
