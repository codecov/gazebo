import { useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'

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
} from 'services/repo'
import Api from 'shared/api'
import { NetworkErrorObject } from 'shared/api/helpers'
import A from 'ui/A'

import { FileComparisonWithBase } from './fragments'
import { transformImpactedFileData } from './utils'

const CoverageLineSchema = z.enum(['H', 'M', 'P'])

const ComparisonSchema = z.object({
  __typename: z.literal('Comparison'),
  impactedFile: z
    .object({
      headName: z.string().nullable(),
      hashedPath: z.string(),
      isNewFile: z.boolean(),
      isRenamedFile: z.boolean(),
      isDeletedFile: z.boolean(),
      isCriticalFile: z.boolean(),
      changeCoverage: z.number().nullable(),
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
      segments: z.object({
        results: z.array(
          z.object({
            header: z.string(),
            hasUnintendedChanges: z.boolean(),
            lines: z.array(
              z.object({
                baseNumber: z.string().nullable(),
                headNumber: z.string().nullable(),
                baseCoverage: CoverageLineSchema.nullable(),
                headCoverage: CoverageLineSchema.nullable(),
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
    })
    .nullable(),
})

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
  filters?: {}
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
                    {/* @ts-expect-error */}
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
            return transformImpactedFileData(
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
