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
} from 'services/repo'
import Api from 'shared/api'
import A from 'ui/A'

const CoverageObjSchema = z.object({
  percentCovered: z.number().nullable(),
})

const ComparisonSchema = z.object({
  __typename: z.literal('Comparison'),
  patchTotals: CoverageObjSchema.nullable(),
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

const RepositorySchema = z.object({
  __typename: z.literal('Repository'),
  commit: z
    .object({
      author: z
        .object({
          username: z.string().nullable(),
        })
        .nullable(),
      branchName: z.string().nullable(),
      ciPassed: z.boolean().nullable(),
      commitid: z.string(),
      createdAt: z.string(),
      message: z.string().nullable(),
      pullId: z.number(),
      compareWithParent: CompareWithParentSchema.nullable(),
    })
    .nullable(),
})

export const CommitHeaderDataTeamSchema = z.object({
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

export type CommitHeaderDataTeam = z.infer<typeof CommitHeaderDataTeamSchema>

const query = `
  query CommitPageHeaderDataTeam(
    $owner: String!
    $repo: String!
    $commitId: String!
  ) {
    owner(username: $owner) {
      repository(name: $repo) {
        __typename
        ... on Repository {
          commit(id: $commitId) {
            author {
              username
            }
            branchName
            ciPassed
            commitid
            createdAt
            message
            pullId
            compareWithParent {
              __typename
              ... on Comparison {
                patchTotals {
                  percentCovered
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
  }
`

interface UseCommitHeaderDataTeamArgs {
  provider: string
  owner: string
  repo: string
  commitId: string
}

export const useCommitHeaderDataTeam = ({
  provider,
  owner,
  repo,
  commitId,
}: UseCommitHeaderDataTeamArgs) =>
  useQuery({
    queryKey: [
      'CommitPageHeaderDataTeam',
      provider,
      owner,
      repo,
      commitId,
      query,
    ],
    queryFn: ({ signal }) =>
      Api.graphql({
        provider,
        query,
        signal,
        variables: {
          provider,
          owner,
          repo,
          commitId,
        },
      }).then((res) => {
        const parsedData = CommitHeaderDataTeamSchema.safeParse(res?.data)

        if (!parsedData.success) {
          return Promise.reject({
            status: 404,
            data: {},
          })
        }

        const data = parsedData.data

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

        return {
          commit: data?.owner?.repository?.commit ?? null,
        }
      }),
  })
