import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'

import Api from 'shared/api'

import {
  RepoNotFoundErrorSchema,
  RepoOwnerNotActivatedErrorSchema,
} from './schemas'

const RepositorySchema = z.object({
  __typename: z.literal('Repository'),
  private: z.boolean(),
  defaultBranch: z.string().nullable(),
  oldestCommitAt: z.string().nullable(),
  coverageEnabled: z.boolean().nullable(),
  bundleAnalysisEnabled: z.boolean().nullable(),
  testAnalyticsEnabled: z.boolean().nullable(),
  languages: z.array(z.string()).nullable(),
})

const RequestSchema = z.object({
  owner: z
    .object({
      repository: z.discriminatedUnion('__typename', [
        RepositorySchema,
        RepoNotFoundErrorSchema,
        RepoOwnerNotActivatedErrorSchema,
      ]),
    })
    .nullable(),
})

const query = `query GetRepoOverview($owner: String!, $repo: String!) {
  owner(username: $owner) {
    repository(name: $repo) {
      __typename
      ... on Repository {
        private
        defaultBranch
        oldestCommitAt
        coverageEnabled
        bundleAnalysisEnabled
        testAnalyticsEnabled
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

interface UseRepoOverviewArgs {
  provider: string
  owner: string
  repo: string
  opts?: {
    enabled?: boolean
  }
}

export function useRepoOverview({
  provider,
  owner,
  repo,
  opts = {},
}: UseRepoOverviewArgs) {
  let enabled = true
  if (opts?.enabled !== undefined) {
    enabled = opts.enabled
  }

  return useQuery({
    queryKey: ['GetRepoOverview', provider, owner, repo],
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
        const parsedData = RequestSchema.safeParse(res?.data)

        if (!parsedData.success) {
          return Promise.reject({
            status: 404,
            data: {},
          })
        }

        const data = parsedData.data

        if (data?.owner?.repository?.__typename === 'NotFoundError') {
          return Promise.reject({
            status: 404,
            data: {},
          })
        }

        if (data?.owner?.repository?.__typename === 'OwnerNotActivatedError') {
          return null
        }

        if (!data?.owner?.repository) {
          return null
        }

        let jsOrTsPresent = false
        if (data.owner.repository.languages) {
          jsOrTsPresent = data.owner.repository.languages.some(
            (lang) =>
              lang.toLowerCase() === 'javascript' ||
              lang.toLowerCase() === 'typescript'
          )
        }

        const coverageEnabled = data.owner.repository.coverageEnabled ?? false
        const isPrivate = data.owner.repository.private ?? false
        const bundleAnalysisEnabled =
          data.owner.repository.bundleAnalysisEnabled ?? false
        const testAnalyticsEnabled =
          data.owner.repository.testAnalyticsEnabled ?? false

        return {
          ...data.owner.repository,
          coverageEnabled,
          private: isPrivate,
          bundleAnalysisEnabled,
          jsOrTsPresent,
          testAnalyticsEnabled,
        }
      })
    },
    enabled,
  })
}
