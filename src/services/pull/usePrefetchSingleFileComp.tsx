import { useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'

import { FirstPullRequestSchema } from 'services/comparison/schemas/FirstPullRequest'
import { MissingBaseCommitSchema } from 'services/comparison/schemas/MissingBaseCommit'
import { MissingBaseReportSchema } from 'services/comparison/schemas/MissingBaseReport'
import { MissingComparisonSchema } from 'services/comparison/schemas/MissingComparison'
import { MissingHeadCommitSchema } from 'services/comparison/schemas/MissingHeadCommit'
import { MissingHeadReportSchema } from 'services/comparison/schemas/MissingHeadReport'
import {
  RepoNotFoundErrorSchema,
  RepoOwnerNotActivatedErrorSchema,
} from 'services/repo'
import Api from 'shared/api'
import { NetworkErrorObject } from 'shared/api/helpers'
import A from 'ui/A'

import { ComparisonSchema, FileComparisonWithBase } from './fragments'
import { transformImpactedPullFileToDiff } from './utils'

const FileComparisonWithBaseSchema = z.object({
  compareWithBase: z
    .discriminatedUnion('__typename', [
      ComparisonSchema,
      FirstPullRequestSchema,
      MissingBaseCommitSchema,
      MissingHeadCommitSchema,
      MissingComparisonSchema,
      MissingBaseReportSchema,
      MissingHeadReportSchema,
    ])
    .nullable(),
})

const RepositorySchema = z.object({
  __typename: z.literal('Repository'),
  pull: FileComparisonWithBaseSchema.nullable(),
})

const RequestSchema = z.object({
  owner: z
    .object({
      repository: z.discriminatedUnion('__typename', [
        RepositorySchema,
        RepoOwnerNotActivatedErrorSchema,
        RepoNotFoundErrorSchema,
      ]),
    })
    .nullable(),
})

const query = `
query ImpactedFileComparison(
  $owner: String!
  $repo: String!
  $pullId: Int!
  $path: String!
  $filters: SegmentsFilters
) {
  owner(username: $owner) {
    repository(name: $repo) {
      __typename
      ... on Repository {
        pull(id: $pullId) {
          ...FileComparisonWithBase
        }
      }
      ... on OwnerNotActivatedError {
        message
      }
      ... on NotFoundError {
        message
      }
    }
  }
}
${FileComparisonWithBase}`

interface UsePrefetchSingleFileCompArgs {
  provider: string
  owner: string
  repo: string
  pullId: string
  path: string
  filters?: object
}

export function usePrefetchSingleFileComp({
  provider,
  owner,
  repo,
  pullId,
  path,
  filters = {},
}: UsePrefetchSingleFileCompArgs) {
  const queryClient = useQueryClient()

  const runPrefetch = async () =>
    await queryClient.prefetchQuery(
      ['ImpactedFileComparison', provider, owner, repo, pullId, path, filters],
      ({ signal }) =>
        Api.graphql({
          provider,
          query,
          signal,
          variables: {
            provider,
            owner,
            repo,
            pullId: parseInt(pullId, 10),
            path,
            filters,
          },
        }).then((res) => {
          const parsedData = RequestSchema.safeParse(res?.data)

          if (!parsedData.success) {
            return Promise.reject({
              status: 404,
              data: {},
              dev: 'usePrefetchSingleFileComp - 404 schema parsing failed',
            } satisfies NetworkErrorObject)
          }

          const data = parsedData.data

          if (data?.owner?.repository?.__typename === 'NotFoundError') {
            return Promise.reject({
              status: 404,
              data: {},
              dev: 'usePrefetchSingleFileComp - 404 NotFoundError',
            } satisfies NetworkErrorObject)
          }

          if (
            data?.owner?.repository?.__typename === 'OwnerNotActivatedError'
          ) {
            return Promise.reject({
              status: 403,
              data: {
                detail: (
                  <p>
                    Activation is required to view this repo, please{' '}
                    {/* @ts-expect-error - A hasn't been typed yet*/}
                    <A to={{ pageName: 'membersTab' }}>click here </A> to
                    activate your account.
                  </p>
                ),
              },
              dev: 'usePrefetchSingleFileComp - 403 OwnerNotActivatedError',
            } satisfies NetworkErrorObject)
          }

          if (
            data.owner?.repository.pull?.compareWithBase?.__typename ===
            'Comparison'
          ) {
            return transformImpactedPullFileToDiff(
              data?.owner?.repository?.pull?.compareWithBase?.impactedFile
            )
          }

          return null
        }),
      {
        staleTime: 10000,
      }
    )

  return { runPrefetch }
}
