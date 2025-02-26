import { queryOptions as queryOptionsV5 } from '@tanstack/react-queryV5'
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
} from 'services/repo'
import Api from 'shared/api'
import { rejectNetworkError } from 'shared/api/rejectNetworkError'
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
        const callingFn = 'CommitHeaderDataTeamQueryOpts'
        const parsedData = CommitHeaderDataTeamSchema.safeParse(res?.data)

        if (!parsedData.success) {
          return rejectNetworkError({
            errorName: 'Parsing Error',
            errorDetails: { callingFn, error: parsedData.error },
          })
        }

        const data = parsedData.data

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

        return {
          commit: data?.owner?.repository?.commit ?? null,
        }
      }),
  })
