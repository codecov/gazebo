import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ParsedQs } from 'qs'
import { z } from 'zod'

import { OrderingDirection } from 'types'

import {
  FirstPullRequestSchema,
  MissingBaseCommitSchema,
  MissingBaseReportSchema,
  MissingComparisonSchema,
  MissingHeadCommitSchema,
  MissingHeadReportSchema,
} from 'services/comparison/schemas'
import { UnknownFlagsSchema } from 'services/impactedFiles/schemas'
import {
  RepoNotFoundErrorSchema,
  RepoOwnerNotActivatedErrorSchema,
} from 'services/repo/schemas'
import Api from 'shared/api'
import {
  ErrorCodeEnum,
  UploadStateEnum,
  UploadTypeEnum,
} from 'shared/utils/commit'
import { Upload } from 'shared/utils/extractUploads'
import { mapEdges } from 'shared/utils/graphql'
import A from 'ui/A'

import { useCompareTotals } from './useCompareTotals'

const CoverageObjSchema = z.object({
  coverage: z.number().nullable(),
})

export const UploadTypeEnumSchema = z.nativeEnum(UploadTypeEnum)

export const UploadStateEnumSchema = z.nativeEnum(UploadStateEnum)

export const UploadErrorCodeEnumSchema = z.nativeEnum(ErrorCodeEnum)

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
    isCriticalFile: z.boolean().nullable(),
    patchCoverage: CoverageObjSchema.nullable(),
    baseCoverage: CoverageObjSchema.nullable(),
    headCoverage: CoverageObjSchema.nullable(),
  })
  .nullable()

export type ImpactedFileType = z.infer<typeof ImpactedFileSchema>

const ImpactedFileResultsSchema = z.object({
  __typename: z.literal('ImpactedFiles'),
  results: z.array(ImpactedFileSchema.nullable()),
})

const ImpactedFileResultsUnionSchema = z.discriminatedUnion('__typename', [
  ImpactedFileResultsSchema,
  UnknownFlagsSchema,
])

export type ImpactedFileResultsUnionType = z.infer<
  typeof ImpactedFileResultsUnionSchema
>

const ComparisonSchema = z.object({
  __typename: z.literal('Comparison'),
  indirectChangedFilesCount: z.number(),
  directChangedFilesCount: z.number(),
  state: z.string(),
  patchTotals: CoverageObjSchema.nullable(),
  impactedFiles: ImpactedFileResultsUnionSchema,
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
  totals: CoverageObjSchema.nullable(),
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
  parent: z
    .object({
      commitid: z.string(),
      totals: CoverageObjSchema.nullable(),
    })
    .nullable(),
  compareWithParent: CompareWithParentSchema.nullable(),
})

export type CommitType = z.infer<typeof CommitSchema>

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

const query = `
query Commit(
  $owner: String!
  $repo: String!
  $commitid: String!
  $filters: ImpactedFilesFilters
  $isTeamPlan: Boolean!
) {
  owner(username: $owner) {
    repository(name: $repo) {
      __typename
      ... on Repository {
        commit(id: $commitid) {
          totals {
            coverage: percentCovered # Absolute coverage of the commit
          }
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
                flags @skip(if: $isTeamPlan)
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
          parent {
            commitid # commitid of the parent, used for the comparison
            totals {
              coverage: percentCovered # coverage of the parent
            }
          }
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
                    isCriticalFile
                    patchCoverage {
                      coverage: percentCovered
                    }
                    headName
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

/*
TODO This/useCommit was not implemented correctly and needs a refactor, leaving for the moment.
- useCommit is not reusable and also does not let you fetch commit data without polling files which is another call
- Refer to the following PR for the change where props of the component are replaced with this hook and for such cases
 we need to address the issue above and refactor the hook for better usage. https://github.com/codecov/gazebo/pull/1248
*/

interface UseCommitArgs {
  provider: string
  owner: string
  repo: string
  commitid: string
  filters?: {
    hasUnintendedChanges?: boolean
    flags?: Array<string> | Array<ParsedQs>
    components?: Array<string> | Array<ParsedQs>
    ordering?: {
      direction?: OrderingDirection
      parameter?:
        | 'FILE_NAME'
        | 'CHANGE_COVERAGE'
        | 'HEAD_COVERAGE'
        | 'MISSES_COUNT'
        | 'PATCH_COVERAGE'
    }
  }
  refetchInterval?: number
  isTeamPlan?: boolean
  forceFail?: boolean
}

export function useCommit({
  provider,
  owner,
  repo,
  commitid,
  filters = {},
  refetchInterval = 2000,
  isTeamPlan = false,
  forceFail = false,
}: UseCommitArgs) {
  const queryClient = useQueryClient()
  const tempKey = [
    'commit',
    provider,
    owner,
    repo,
    commitid,
    query,
    filters,
    isTeamPlan,
  ]
  const commitQuery = useQuery({
    queryKey: tempKey,
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
          isTeamPlan,
        },
      }).then((res) => {
        const parsedRes = RequestSchema.safeParse(res?.data)

        console.log({ parsedRes })

        if (forceFail) {
          console.log('FORCE FAIL')
          return Promise.reject({
            status: 404,
            data: parsedRes.error,
          })
        }

        if (!parsedRes.success) {
          return Promise.reject({
            status: 404,
            data: parsedRes.error,
          })
        }

        const data = parsedRes.data

        if (data?.owner?.repository?.__typename === 'NotFoundError') {
          return Promise.reject({
            status: 404,
            data: {},
          })
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
          })
        }

        const commit = data?.owner?.repository?.commit
        const uploadEdges = data?.owner?.repository?.commit?.uploads

        const uploads: Upload[] = []
        mapEdges(uploadEdges).forEach((upload) => {
          if (upload === null) {
            return
          }
          const errors = mapEdges(upload.errors)

          uploads.push({
            ...upload,
            errors: errors,
          })
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
  })

  let shouldPoll = false
  if (
    commitQuery?.data?.commit?.compareWithParent?.__typename === 'Comparison'
  ) {
    shouldPoll =
      commitQuery?.data?.commit?.compareWithParent?.state === 'pending'
  }

  useCompareTotals({
    provider,
    owner,
    repo,
    commitid,
    filters,
    opts: {
      refetchInterval,
      enabled: shouldPoll,
      onSuccess: (data) => {
        let compareWithParent
        if (data?.owner?.repository?.__typename === 'Repository') {
          compareWithParent = data?.owner?.repository?.commit?.compareWithParent
        }

        const impactedFileData = {
          ...commitQuery?.data,
          commit: {
            ...commitQuery?.data?.commit,
            compareWithParent,
          },
        }
        queryClient.setQueryData(tempKey, impactedFileData)
      },
    },
  })

  return commitQuery
}
