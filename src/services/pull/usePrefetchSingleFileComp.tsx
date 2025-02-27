import { useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'

import { FirstPullRequestSchema } from 'services/comparison/schemas/FirstPullRequest'
import { MissingBaseCommitSchema } from 'services/comparison/schemas/MissingBaseCommit'
import { MissingBaseReportSchema } from 'services/comparison/schemas/MissingBaseReport'
import { MissingComparisonSchema } from 'services/comparison/schemas/MissingComparison'
import { MissingHeadCommitSchema } from 'services/comparison/schemas/MissingHeadCommit'
import { MissingHeadReportSchema } from 'services/comparison/schemas/MissingHeadReport'
import { RepoNotFoundErrorSchema } from 'services/repo/schemas/RepoNotFoundError'
import { RepoOwnerNotActivatedErrorSchema } from 'services/repo/schemas/RepoOwnerNotActivatedError'
import Api from 'shared/api'
import { rejectNetworkError } from 'shared/api/rejectNetworkError'
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
          const callingFn = 'usePrefetchSingleFileComp'
          const parsedData = RequestSchema.safeParse(res?.data)

          if (!parsedData.success) {
            return rejectNetworkError({
              errorName: 'Parsing Error',
              errorDetails: { callingFn, error: parsedData.error },
            })
          }

          const data = parsedData.data

          if (data?.owner?.repository?.__typename === 'NotFoundError') {
            return rejectNetworkError({
              errorName: 'Not Found Error',
              errorDetails: { callingFn },
            })
          }

          if (
            data?.owner?.repository?.__typename === 'OwnerNotActivatedError'
          ) {
            return rejectNetworkError({
              errorName: 'Owner Not Activated',
              errorDetails: { callingFn },
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
            })
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
