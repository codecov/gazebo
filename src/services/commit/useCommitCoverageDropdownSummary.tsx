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
import { UploadStateEnum } from 'shared/utils/commit'
import { mapEdges } from 'shared/utils/graphql'
import A from 'ui/A'

const ComparisonSchema = z.object({
  __typename: z.literal('Comparison'),
  patchTotals: z
    .object({
      missesCount: z.number().nullable(),
      partialsCount: z.number().nullable(),
    })
    .nullable(),
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

const NodeSchema = z.object({
  node: z.object({ state: z.nativeEnum(UploadStateEnum) }),
})

const RepositorySchema = z.object({
  __typename: z.literal('Repository'),
  commit: z
    .object({
      compareWithParent: CompareWithParentSchema.nullable(),
      uploads: z
        .object({
          edges: z.array(NodeSchema.nullable()),
        })
        .nullish(),
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
query CommitDropdownSummary(
  $owner: String!
  $repo: String!
  $commitid: String!
) {
  owner(username: $owner) {
    repository(name: $repo) {
      __typename
      ... on Repository {
        commit(id: $commitid) {
          uploads {
            edges {
              node {
                state
              }
            }
          }
          compareWithParent {
            __typename
            ... on Comparison {
              patchTotals {
                missesCount
                partialsCount
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

interface useCommitCoverageDropdownSummaryArgs {
  provider: string
  owner: string
  repo: string
  commitid: string
}

export function useCommitCoverageDropdownSummary({
  provider,
  owner,
  repo,
  commitid,
}: useCommitCoverageDropdownSummaryArgs) {
  return useQuery({
    queryKey: ['CommitDropdownSummary', provider, owner, repo, commitid],
    queryFn: ({ signal }) =>
      Api.graphql({
        provider,
        query,
        signal,
        variables: {
          owner,
          repo,
          commitid,
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

        const uploadErrorCount = mapEdges(
          data?.owner?.repository?.commit?.uploads
        ).reduce((acc, upload) => {
          if (upload?.state === UploadStateEnum.error) {
            return acc + 1
          }
          return acc
        }, 0)

        const commit = data?.owner?.repository?.commit ?? null

        if (commit !== null && commit.uploads) {
          delete commit.uploads
        }

        return {
          uploadErrorCount,
          commit,
        }
      }),
  })
}
