import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
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
} from 'services/repo/schemas'
import Api from 'shared/api'
import { rejectNetworkError } from 'shared/api/rejectNetworkError'
import A from 'ui/A'

const CoverageObjSchema = z.object({
  coverage: z.number().nullable(),
})

const ImpactedFileSchema = z
  .object({
    headName: z.string().nullable(),
    patchCoverage: CoverageObjSchema.nullable(),
    baseCoverage: CoverageObjSchema.nullable(),
    headCoverage: CoverageObjSchema.nullable(),
  })
  .nullable()

const ImpactedFilesSchema = z.discriminatedUnion('__typename', [
  z.object({
    __typename: z.literal('ImpactedFiles'),
    results: z.array(ImpactedFileSchema).nullable(),
  }),
  z.object({
    __typename: z.literal('UnknownFlags'),
    message: z.string(),
  }),
])

const ComparisonSchema = z.object({
  __typename: z.literal('Comparison'),
  state: z.string(),
  indirectChangedFilesCount: z.number(),
  directChangedFilesCount: z.number(),
  patchTotals: CoverageObjSchema.nullable(),
  impactedFiles: ImpactedFilesSchema,
})

const CompareWithParentSchema = z
  .discriminatedUnion('__typename', [
    ComparisonSchema,
    FirstPullRequestSchema,
    MissingBaseCommitSchema,
    MissingBaseReportSchema,
    MissingComparisonSchema,
    MissingHeadCommitSchema,
    MissingHeadReportSchema,
  ])
  .nullable()

const RepositorySchema = z.object({
  __typename: z.literal('Repository'),
  commit: z
    .object({
      compareWithParent: CompareWithParentSchema.nullable(),
    })
    .nullable(),
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

const query = `
query CompareTotals(
  $owner: String!
  $repo: String!
  $commitid: String!
  $filters: ImpactedFilesFilters
) {
  owner(username: $owner) {
    repository(name: $repo) {
      __typename
      ... on Repository {
        commit(id: $commitid) {
          compareWithParent {
            __typename
            ... on Comparison {
              state
              indirectChangedFilesCount
              directChangedFilesCount
              patchTotals {
                coverage: percentCovered
              }
              impactedFiles(filters: $filters) {
                __typename
                ... on ImpactedFiles {
                  results {
                    headName
                    patchCoverage {
                      coverage: percentCovered
                    }
                    baseCoverage {
                      coverage: percentCovered
                    }
                    headCoverage {
                      coverage: percentCovered
                    }
                  }
                }
                ... on UnknownFlags {
                  message
                }
              }
            }
            ... on FirstPullRequest {
              message
            }
            ... on MissingBaseCommit {
              message
            }
            ... on MissingHeadCommit {
              message
            }
            ... on MissingComparison {
              message
            }
            ... on MissingBaseReport {
              message
            }
            ... on MissingHeadReport {
              message
            }
          }
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

interface UseCompareTotalsArgs {
  provider: string
  owner: string
  repo: string
  commitid: string
  filters?: object
  opts?: UseQueryOptions<z.infer<typeof RequestSchema>>
}

export function useCompareTotals({
  provider,
  owner,
  repo,
  commitid,
  filters = {},
  opts,
}: UseCompareTotalsArgs) {
  return useQuery({
    queryKey: [
      'impactedFiles',
      provider,
      owner,
      repo,
      commitid,
      query,
      filters,
    ],
    queryFn: ({ signal }) => {
      return Api.graphql({
        provider,
        query,
        signal,
        variables: {
          owner,
          repo,
          commitid,
          filters,
        },
      }).then((res) => {
        const callingFn = 'useCompareTotals'
        const parsedRes = RequestSchema.safeParse(res?.data)

        if (!parsedRes.success) {
          return rejectNetworkError({
            errorName: 'Parsing Error',
            errorDetails: { callingFn, error: parsedRes.error },
          })
        }

        const data = parsedRes.data

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

        return data
      })
    },
    ...(!!opts && opts),
  })
}
