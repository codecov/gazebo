import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'

import { RepoNotFoundErrorSchema } from 'services/repo'
import Api from 'shared/api'

const GamificationMetricSchema = z.enum([
  'PATCH_COVERAGE_AVERAGE',
  'CHANGE_COVERAGE_COUNT',
  'PR_COUNT',
])

const AchievementDataSchema = z.object({
  author: z.object({
    username: z.string(),
    avatarUrl: z.string().url().optional(),
  }),
  value: z.number(),
})

const AchievementSchema = z.object({
  name: GamificationMetricSchema,
  ranking: z.array(AchievementDataSchema),
})

const RepositoryWithAchievementsSchema = z.object({
  __typename: z.literal('Repository'),
  active: z.boolean(),
  leaderboards: z.array(AchievementSchema),
})

const RequestSchema = z.object({
  owner: z
    .object({
      repository: z
        .discriminatedUnion('__typename', [
          RepositoryWithAchievementsSchema,
          RepoNotFoundErrorSchema,
        ])
        .nullable(),
    })
    .nullable(),
})

const achievementsQuery = `query GetAchievements($owner: String!, $repo: String!) {
  owner(username: $owner) {
    repository(name: $repo) {
      __typename
      ... on Repository {
        active
        leaderboards {
          name
          ranking {
            author {
              username
              avatarUrl
            }
            value
          }
        }
      }
      ... on NotFoundError {
        message
      }
    }
  }
}`

interface UseAchievementsArgs {
  provider: string
  owner: string
  repo: string
  opts?: {
    enabled?: boolean
  }
}

export function useAchievements({
  provider,
  owner,
  repo,
  opts = {},
}: UseAchievementsArgs) {
  let enabled = true
  if (opts?.enabled !== undefined) {
    enabled = opts.enabled
  }

  return useQuery({
    queryKey: ['GetAchievements', provider, owner, repo],
    queryFn: ({ signal }) => {
      return Api.graphql({
        provider,
        signal,
        query: achievementsQuery,
        variables: {
          owner,
          repo,
        },
      }).then((res) => {
        const parsedData = RequestSchema.safeParse(res?.data)

        if (!parsedData.success) {
          return Promise.reject({
            status: 404,
            data: {},
            dev: 'useAchievements - 404 schema parsing failed',
          })
        }

        const repository = parsedData.data?.owner?.repository

        if (repository?.__typename === 'NotFoundError') {
          return Promise.reject({
            status: 404,
            data: {},
            dev: 'useAchievements - 404 not found error',
          })
        }

        return repository
      })
    },
    enabled,
  })
}
