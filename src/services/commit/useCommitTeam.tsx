import { useQuery, useQueryClient } from '@tanstack/react-query'
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
import {
  ErrorCodeEnum,
  UploadStateEnum,
  UploadTypeEnum,
} from 'shared/utils/commit'
import { mapEdges } from 'shared/utils/graphql'
import A from 'ui/A'

import { useCompareTotalsTeam } from './useCompareTotalsTeam'

export const OrderingDirection = {
  desc: 'DESC',
  asc: 'ASC',
} as const

export const OrderingParameter = {
  FILE_NAME: 'FILE_NAME',
  MISSES_COUNT: 'MISSES_COUNT',
  PATCH_COVERAGE: 'PATCH_COVERAGE',
} as const

interface ImpactedFilesOrdering {
  direction?: (typeof OrderingDirection)[keyof typeof OrderingDirection]
  parameter?: (typeof OrderingParameter)[keyof typeof OrderingParameter]
}

const CoverageObjSchema = z.object({
  coverage: z.number().nullable(),
})

const UploadTypeEnumSchema = z.nativeEnum(UploadTypeEnum)

const UploadStateEnumSchema = z.nativeEnum(UploadStateEnum)

const UploadErrorCodeEnumSchema = z.nativeEnum(ErrorCodeEnum)

const UploadErrorSchema = z.object({
  errorCode: UploadErrorCodeEnumSchema.nullable(),
})

const ErrorsSchema = z.object({
  edges: z.array(
    z
      .object({
        node: UploadErrorSchema,
      })
      .nullable()
  ),
})

const UploadSchema = z.object({
  id: z.number().nullable(),
  state: UploadStateEnumSchema,
  provider: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  flags: z.array(z.string()).nullable(),
  jobCode: z.string().nullable(),
  downloadUrl: z.string(),
  ciUrl: z.string().nullable(),
  uploadType: UploadTypeEnumSchema,
  buildCode: z.string().nullable(),
  name: z.string().nullable(),
  errors: ErrorsSchema.nullable(),
})

const UploadsSchema = z.object({
  edges: z.array(
    z
      .object({
        node: UploadSchema,
      })
      .nullable()
  ),
})

const ImpactedFileSchema = z
  .object({
    headName: z.string().nullable(),
    missesCount: z.number(),
    patchCoverage: CoverageObjSchema.nullable(),
  })
  .nullable()

export type ImpactedFile = z.infer<typeof ImpactedFileSchema>

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
  indirectChangedFilesCount: z.number(),
  directChangedFilesCount: z.number(),
  state: z.string(),
  patchTotals: CoverageObjSchema.nullable(),
  impactedFiles: ImpactedFilesSchema,
})

const CompareWithParentSchema = z.discriminatedUnion('__typename', [
  ComparisonSchema,
  FirstPullRequestSchema,
  MissingBaseCommitSchema,
  MissingBaseReportSchema,
  MissingComparisonSchema,
  MissingHeadCommitSchema,
  MissingHeadReportSchema,
])

const CommitSchema = z.object({
  state: z.string().nullable(),
  commitid: z.string(),
  pullId: z.number().nullable(),
  branchName: z.string().nullable(),
  createdAt: z.string(),
  author: z
    .object({
      username: z.string().nullable(),
    })
    .nullable(),
  uploads: UploadsSchema.nullable(),
  message: z.string().nullable(),
  ciPassed: z.boolean().nullable(),
  compareWithParent: CompareWithParentSchema.nullable(),
})

const RepositorySchema = z.object({
  __typename: z.literal('Repository'),
  commit: CommitSchema.nullable(),
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

const query = `query GetCommitTeam(
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
          state
          commitid
          pullId
          branchName
          createdAt
          author {
            username
          }
          uploads {
            edges {
              node {
                id
                state
                provider
                createdAt
                updatedAt
                flags
                jobCode
                downloadUrl
                ciUrl
                uploadType
                buildCode
                name
                errors {
                  edges {
                    node {
                      errorCode
                    }
                  }
                }
              }
            }
          }
          message
          ciPassed
          compareWithParent {
            __typename
            ... on Comparison {
              indirectChangedFilesCount
              directChangedFilesCount
              state
              patchTotals {
                coverage: percentCovered
              }
              impactedFiles(filters: $filters) {
                __typename
                ... on ImpactedFiles {
                  results {
                    headName
                    missesCount
                    patchCoverage {
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

interface UseCommitTeamArgs {
  provider: string
  owner: string
  repo: string
  commitid: string
  filters?: {
    hasUnintendedChanges?: boolean
    flags?: Array<string>
    ordering?: ImpactedFilesOrdering
  }
  refetchInterval?: number
}

export function useCommitTeam({
  provider,
  owner,
  repo,
  commitid,
  filters = {},
  refetchInterval = 2000,
}: UseCommitTeamArgs) {
  const queryClient = useQueryClient()
  const commitKey = [
    'GetCommitTeam',
    provider,
    owner,
    repo,
    commitid,
    query,
    filters,
  ]

  const commitQuery = useQuery({
    queryKey: commitKey,
    queryFn: ({ signal }) =>
      Api.graphql({
        provider,
        query,
        signal,
        variables: {
          provider,
          owner,
          repo,
          commitid,
          filters,
        },
      }).then((res) => {
        const callingFn = 'useCommitTeam'
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

        const commit = data?.owner?.repository?.commit
        const uploadEdges = data?.owner?.repository?.commit?.uploads

        const uploads = mapEdges(uploadEdges).map((upload) => {
          const errors = mapEdges(upload?.errors)

          return {
            ...upload,
            errors: errors,
          }
        })

        if (!commit) {
          return {
            commit: null,
          }
        }
        return {
          commit: {
            ...commit,
            uploads,
          },
        }
      }),
    suspense: false,
  })

  let shouldPoll = false
  if (
    commitQuery?.data?.commit?.compareWithParent?.__typename === 'Comparison'
  ) {
    shouldPoll =
      commitQuery?.data?.commit?.compareWithParent?.state === 'pending'
  }

  useCompareTotalsTeam({
    provider,
    owner,
    repo,
    commitid,
    filters,
    opts: {
      refetchInterval,
      enabled: shouldPoll,
      suspense: false,
      onSuccess: (data) => {
        let compareWithParent = undefined
        if (data?.compareWithParent?.__typename === 'Comparison') {
          compareWithParent = data?.compareWithParent
        }

        const impactedFileData = {
          ...commitQuery?.data,
          commit: {
            ...commitQuery?.data?.commit,
            compareWithParent,
          },
        }
        queryClient.setQueryData(commitKey, impactedFileData)
      },
    },
  })

  return commitQuery
}
