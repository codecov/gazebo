import { queryOptions as queryOptionsV5 } from '@tanstack/react-queryV5'
import { z } from 'zod'

import { RepoNotFoundErrorSchema } from 'services/repo/schemas/RepoNotFoundError'
import { RepoOwnerNotActivatedErrorSchema } from 'services/repo/schemas/RepoOwnerNotActivatedError'
import Api from 'shared/api/api'
import { rejectNetworkError } from 'shared/api/rejectNetworkError'
import A from 'ui/A'

const RepositorySchema = z.object({
  __typename: z.literal('Repository'),
  coverageEnabled: z.boolean().nullable(),
  bundleAnalysisEnabled: z.boolean().nullable(),
  testAnalyticsEnabled: z.boolean().nullable(),
  yaml: z.string().nullable(),
  languages: z.array(z.string()).nullable(),
  coverageAnalytics: z
    .object({
      flagsCount: z.number(),
      componentsCount: z.number(),
    })
    .nullable(),
})

const PlanSchema = z
  .object({
    isTeamPlan: z.boolean(),
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

const query = `
query GetRepoConfigurationStatus($owner: String!, $repo: String!) {
  owner(username: $owner) {
    plan {
      isTeamPlan
    }
    repository(name:$repo) {
      __typename
      ... on Repository {
        coverageEnabled
        bundleAnalysisEnabled
        testAnalyticsEnabled
        yaml
        languages
        coverageAnalytics {
          flagsCount
          componentsCount
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

interface RepoConfigurationStatusQueryArgs {
  provider: string
  owner: string
  repo: string
}

export function RepoConfigurationStatusQueryOpts({
  provider,
  owner,
  repo,
}: RepoConfigurationStatusQueryArgs) {
  return queryOptionsV5({
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
          return rejectNetworkError({
            errorName: 'Parsing Error',
            errorDetails: {
              callingFn: 'RepoConfigurationStatusQueryOpts',
              error: parsedRes.error,
            },
          })
        }

        const data = parsedRes.data

        if (data?.owner?.repository?.__typename === 'NotFoundError') {
          return rejectNetworkError({
            errorName: 'Not Found Error',
            errorDetails: { callingFn: 'RepoConfigurationStatusQueryOpts' },
          })
        }

        if (data?.owner?.repository?.__typename === 'OwnerNotActivatedError') {
          return rejectNetworkError({
            errorName: 'Owner Not Activated',
            errorDetails: { callingFn: 'RepoConfigurationStatusQueryOpts' },
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
          plan: data?.owner?.plan ?? null,
          repository: data?.owner?.repository ?? null,
        }
      })
    },
  })
}
