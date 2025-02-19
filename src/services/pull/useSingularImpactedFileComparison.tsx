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
import { NetworkErrorObject } from 'shared/api/helpers'
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
        const parsedRes = RepoSchema.safeParse(res?.data)

        if (!parsedRes.success) {
          return Promise.reject({
            status: 404,
            data: {},
            dev: 'useSingularImpactedFileComparison - 404 failed to parse',
          } satisfies NetworkErrorObject)
        }

        const { data } = parsedRes

        if (data?.owner?.repository?.__typename === 'NotFoundError') {
          return Promise.reject({
            status: 404,
            data: {},
            dev: 'useSingularImpactedFileComparison - 404 NotFoundError',
          } satisfies NetworkErrorObject)
        }

        if (data?.owner?.repository?.__typename === 'OwnerNotActivatedError') {
          return Promise.reject({
            status: 403,
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
            dev: 'useSingularImpactedFileComparison - 403 OwnerNotActivatedError',
          } satisfies NetworkErrorObject)
        }

        if (
          data?.owner?.repository?.pull?.compareWithBase?.__typename ===
          'Comparison'
        ) {
          return transformImpactedPullFileToDiff(
            data?.owner?.repository?.pull?.compareWithBase?.impactedFile
          )
        }

        return Promise.reject({
          status: 404,
          data: {},
          dev: 'useSingularImpactedFileComparison - 404 missing data',
        } satisfies NetworkErrorObject)
      }),
  })
}
