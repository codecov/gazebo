import { useQuery } from '@tanstack/react-query'
import z from 'zod'

import { FirstPullRequestSchema } from 'services/comparison/schemas/FirstPullRequest'
import { MissingBaseCommitSchema } from 'services/comparison/schemas/MissingBaseCommit'
import { MissingBaseReportSchema } from 'services/comparison/schemas/MissingBaseReport'
import { MissingComparisonSchema } from 'services/comparison/schemas/MissingComparison'
import { MissingHeadCommitSchema } from 'services/comparison/schemas/MissingHeadCommit'
import { MissingHeadReportSchema } from 'services/comparison/schemas/MissingHeadReport'
import {
  RepoNotFoundErrorSchema,
  RepoOwnerNotActivatedErrorSchema,
} from 'services/repo/schemas'
import Api from 'shared/api'
import { rejectNetworkError } from 'shared/api/rejectNetworkError'
import A from 'ui/A'

import {
  ComparisonSchema,
  FileComparisonWithBase,
  ImpactedFileSchema,
} from './fragments'
import { transformImpactedPullFileToDiff } from './utils'

export type PullImpactedFile = z.infer<typeof ImpactedFileSchema>

const query = `
query ImpactedFileComparison($owner: String!, $repo: String!, $pullId: Int!, $path: String!, $filters: SegmentsFilters) {
  owner(username: $owner) {
    repository(name: $repo) {
      __typename
      ... on Repository {
        pull(id: $pullId) {
          ...FileComparisonWithBase
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
${FileComparisonWithBase}
`

const RepositorySchema = z.object({
  __typename: z.literal('Repository'),
  pull: z.object({
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
  }),
})

export const RepoSchema = z.object({
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

interface ImpactedFileComparisonProps {
  provider: string
  owner: string
  repo: string
  pullId: string
  path: string
  filters?: {
    hasUnintendedChanges?: boolean
  }
}

export function useSingularImpactedFileComparison({
  provider,
  owner,
  repo,
  pullId,
  path,
  filters = {},
}: ImpactedFileComparisonProps) {
  return useQuery({
    queryKey: [
      'ImpactedFileComparison',
      provider,
      owner,
      repo,
      pullId,
      path,
      filters,
      query,
    ],
    queryFn: ({ signal }) =>
      Api.graphql({
        provider,
        query,
        signal,
        variables: {
          owner,
          repo,
          pullId: parseInt(pullId, 10),
          path,
          filters,
        },
      }).then((res) => {
        const callingFn = 'useSingularImpactedFileComparison'
        const parsedRes = RepoSchema.safeParse(res?.data)

        if (!parsedRes.success) {
          return rejectNetworkError({
            errorName: 'Parsing Error',
            errorDetails: { callingFn, error: parsedRes.error },
          })
        }

        const { data } = parsedRes

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

        if (
          data?.owner?.repository?.pull?.compareWithBase?.__typename ===
          'Comparison'
        ) {
          return transformImpactedPullFileToDiff(
            data?.owner?.repository?.pull?.compareWithBase?.impactedFile
          )
        }

        // we can set to null, and use the error display message we currently have, rather than throwing
        return null
      }),
  })
}
