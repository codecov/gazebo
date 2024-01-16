import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'

import {
  FirstPullRequestSchema,
  MissingBaseCommitSchema,
  MissingBaseReportSchema,
  MissingComparisonSchema,
  MissingHeadCommitSchema,
  MissingHeadReportSchema,
} from 'services/comparison/schemas'
import {
  RepoNotFoundErrorSchema,
  RepoOwnerNotActivatedErrorSchema,
} from 'services/repo/schemas'
import Api from 'shared/api'
import { userHasAccess } from 'shared/utils/user'
import A from 'ui/A'

import { PullCompareWithBaseFragment } from './fragments'

export const OrderingDirection = {
  desc: 'DESC',
  asc: 'ASC',
} as const

export const OrderingParameter = {
  FILE_NAME: 'FILE_NAME',
  MISSES_COUNT: 'MISSES_COUNT',
  PATCH_COVERAGE: 'PATCH_COVERAGE',
} as const

const ImpactedFilesOrdering = z.object({
  direction: z.nativeEnum(OrderingDirection).optional(),
  parameter: z.nativeEnum(OrderingParameter).optional(),
})

const percentCoveredSchema = z.object({
  percentCovered: z.number().nullable(),
})

const ImpactedFileSchema = z
  .object({
    fileName: z.string().nullable(),
    headName: z.string().nullable(),
    missesCount: z.number(),
    isCriticalFile: z.boolean(),
    patchCoverage: percentCoveredSchema.nullable(),
    baseCoverage: percentCoveredSchema.nullable(),
    headCoverage: percentCoveredSchema.nullable(),
    changeCoverage: z.number().nullable(),
  })
  .nullable()

export type ImpactedFile = z.infer<typeof ImpactedFileSchema>

const ImpactedFilesSchema = z.discriminatedUnion('__typename', [
  z.object({
    __typename: z.literal('ImpactedFiles'),
    results: z.array(ImpactedFileSchema),
  }),
  z.object({
    __typename: z.literal('UnknownFlags'),
    message: z.string(),
  }),
])

const flagsComparisonsSchema = z
  .object({
    name: z.string().nullable(),
    patchTotals: percentCoveredSchema.nullable(),
    headTotals: percentCoveredSchema.nullable(),
    baseTotals: percentCoveredSchema.nullable(),
  })
  .nullable()

const ComparisonSchema = z.object({
  __typename: z.literal('Comparison'),
  state: z.string(),
  patchTotals: percentCoveredSchema.nullable(),
  baseTotals: percentCoveredSchema.nullable(),
  headTotals: percentCoveredSchema.nullable(),
  impactedFiles: ImpactedFilesSchema,
  flagComparisons: z.array(flagsComparisonsSchema).nullable(),
  changeCoverage: z.number().nullable(),
  hasDifferentNumberOfHeadAndBaseReports: z.boolean(),
})

const CompareWithBaseSchema = z.discriminatedUnion('__typename', [
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
  message: z.string().nullable(),
  author: z
    .object({
      username: z.string().nullable(),
    })
    .nullable(),
})

const PullSchema = z.object({
  behindBy: z.number().nullable(),
  behindByCommit: z.string().nullable(),
  pullId: z.number().nullable(),
  title: z.string().nullable(),
  state: z.string().nullable(),
  updatestamp: z.string().nullable(),
  author: z
    .object({
      username: z.string().nullable(),
    })
    .nullable(),
  comparedTo: z
    .object({
      commitid: z.string().nullable(),
      uploads: z
        .object({
          totalCount: z.number().nullable(),
        })
        .nullable(),
    })
    .nullable(),
  head: z
    .object({
      state: z.string().nullable(),
      ciPassed: z.boolean().nullable(),
      branchName: z.string().nullable(),
      commitid: z.string().nullable(),
      totals: z
        .object({
          percentCovered: z.number().nullable(),
        })
        .nullable(),
      uploads: z
        .object({
          totalCount: z.number().nullable(),
        })
        .nullable(),
    })
    .nullable(),
  commits: z
    .object({
      edges: z.array(
        z
          .object({
            node: CommitSchema,
          })
          .nullable()
      ),
    })
    .nullable(),
  compareWithBase: CompareWithBaseSchema.nullable(),
})

const RepositorySchema = z.object({
  defaultBranch: z.string().nullable(),
  private: z.boolean(),
  __typename: z.literal('Repository'),
  pull: PullSchema.nullable(),
})

const RequestSchema = z.object({
  owner: z
    .object({
      isCurrentUserPartOfOrg: z.boolean(),
      repository: z.discriminatedUnion('__typename', [
        RepositorySchema,
        RepoNotFoundErrorSchema,
        RepoOwnerNotActivatedErrorSchema,
      ]),
    })
    .nullable(),
})

const query = `query Pull(
  $owner: String!
  $repo: String!
  $pullId: Int!
  $filters: ImpactedFilesFilters
) {
  owner(username: $owner) {
    isCurrentUserPartOfOrg
    repository(name: $repo) {
      __typename
      ... on Repository {
        defaultBranch
      	private
        pull(id: $pullId) {
          behindBy
          behindByCommit
          pullId
          title
          state
          updatestamp
          author {
            username
          }
          head {
            state
            ciPassed
            branchName
            commitid
            totals {
              percentCovered
            }
            uploads {
              totalCount
            }
          }
          comparedTo {
            commitid
            uploads {
              totalCount
            }
          }
          commits {
            edges {
              node {
                state
                commitid
                message
                author {
                  username
                }
              }
            }
          }
          ...PullCompareWithBaseFragment
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
${PullCompareWithBaseFragment}
`

interface UsePullArgs {
  provider: string
  owner: string
  repo: string
  pullId: string
  filters?: {
    hasUnintendedChanges?: boolean
    ordering?: z.infer<typeof ImpactedFilesOrdering>
  }
}

export function usePull({
  provider,
  owner,
  repo,
  pullId,
  filters = {},
}: UsePullArgs) {
  const pullKey = ['Pull', provider, owner, repo, pullId, query, filters]

  const pullQuery = useQuery({
    queryKey: pullKey,
    queryFn: ({ signal }) =>
      Api.graphql({
        provider,
        query,
        signal,
        variables: {
          owner,
          repo,
          pullId: parseInt(pullId, 10),
          filters,
        },
      }).then((res) => {
        const parsedRes = RequestSchema.safeParse(res?.data)

        if (!parsedRes.success) {
          return Promise.reject({
            status: 404,
            data: null,
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

        const pull = data?.owner?.repository?.pull

        if (!pull) {
          return {
            pull: null,
          }
        }
        return {
          pull: {
            ...pull,
          },
          hasAccess: userHasAccess({
            privateRepo: data?.owner?.repository?.private,
            isCurrentUserPartOfOrg: data?.owner?.isCurrentUserPartOfOrg,
          }),
          defaultBranch: data?.owner?.repository?.defaultBranch,
        }
      }),
    suspense: false,
  })

  return pullQuery
}
