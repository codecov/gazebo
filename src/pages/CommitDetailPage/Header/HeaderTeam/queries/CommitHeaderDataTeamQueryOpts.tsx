import { queryOptions as queryOptionsV5 } from '@tanstack/react-queryV5'
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
import { rejectNetworkError } from 'shared/api/helpers'
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
      pullId: z.number().nullable(),
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

interface CommitHeaderDataTeamQueryArgs {
  provider: string
  owner: string
  repo: string
  commitId: string
}

export const CommitHeaderDataTeamQueryOpts = ({
  provider,
  owner,
  repo,
  commitId,
}: CommitHeaderDataTeamQueryArgs) =>
  queryOptionsV5({
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
          return rejectNetworkError({
            status: 404,
            data: {},
            dev: 'CommitHeaderDataTeamQueryOpts - 404 Failed to parse schema',
            error: parsedData.error,
          })
        }

        const data = parsedData.data

        if (data?.owner?.repository?.__typename === 'NotFoundError') {
          return rejectNetworkError({
            status: 404,
            data: {},
            dev: 'CommitHeaderDataTeamQueryOpts - 404 Not Found',
          })
        }

        if (data?.owner?.repository?.__typename === 'OwnerNotActivatedError') {
          return rejectNetworkError({
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
            dev: 'CommitHeaderDataTeamQueryOpts - 403 Owner Not Activated',
          })
        }

        return {
          commit: data?.owner?.repository?.commit ?? null,
        }
      }),
  })
