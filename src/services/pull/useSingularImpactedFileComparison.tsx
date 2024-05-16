import { useQuery } from '@tanstack/react-query'
import z from 'zod'

import {
  FirstPullRequestSchema,
  MissingBaseCommitSchema,
  MissingBaseReportSchema,
  MissingComparisonSchema,
  MissingHeadCommitSchema,
  MissingHeadReportSchema,
} from 'services/comparison'
import {
  RepoNotFoundErrorSchema,
  RepoOwnerNotActivatedErrorSchema,
} from 'services/repo/schemas'
import Api from 'shared/api'
import { NetworkErrorObject } from 'shared/api/helpers'
import A from 'ui/A'

import { FileComparisonWithBase } from './fragments'
import { transformImpactedFileData } from './utils'

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

const ImpactedFileSchema = z.object({
  headName: z.string().nullable(),
  hashedPath: z.string(),
  isNewFile: z.boolean(),
  isRenamedFile: z.boolean(),
  isDeletedFile: z.boolean(),
  isCriticalFile: z.boolean(),
  baseCoverage: z
    .object({
      percentCovered: z.number().nullable(),
    })
    .nullable(),
  headCoverage: z
    .object({
      percentCovered: z.number().nullable(),
    })
    .nullable(),
  patchCoverage: z
    .object({
      percentCovered: z.number().nullable(),
    })
    .nullable(),
  changeCoverage: z.number().nullable(),
  segments: z.discriminatedUnion('__typename', [
    z.object({
      __typename: z.literal('SegmentComparisons'),
      results: z.array(
        z.object({
          header: z.string(),
          hasUnintendedChanges: z.boolean(),
          lines: z.array(
            z.object({
              baseNumber: z.string().nullable(),
              headNumber: z.string().nullable(),
              baseCoverage: z.string().nullable(),
              headCoverage: z.string().nullable(),
              content: z.string().nullable(),
              coverageInfo: z.object({
                hitCount: z.number().nullable(),
                hitUploadIds: z.array(z.number()).nullable(),
              }),
            })
          ),
        })
      ),
    }),
  ]),
})

const RepositorySchema = z.object({
  __typename: z.literal('Repository'),
  pull: z
    .object({
      compareWithBase: z.discriminatedUnion('__typename', [
        z.object({
          __typename: z.literal('Comparison'),
          impactedFile: ImpactedFileSchema,
        }),
        FirstPullRequestSchema,
        MissingBaseCommitSchema,
        MissingBaseReportSchema,
        MissingComparisonSchema,
        MissingHeadCommitSchema,
        MissingHeadReportSchema,
      ]),
    })
    .nullable(),
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
                  {/* @ts-expect-error */}
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
          return transformImpactedFileData(
            data?.owner?.repository?.pull?.compareWithBase?.impactedFile
          )
        }
        return null
      }),
    suspense: false,
  })
}
