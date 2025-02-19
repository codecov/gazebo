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
import A from 'ui/A'

const CoverageObjSchema = z.object({
  percentCovered: z.number().nullable(),
})

const ComparisonSchema = z.object({
  __typename: z.literal('Comparison'),
  patchTotals: CoverageObjSchema.nullable(),
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

const RepositorySchema = z.object({
  __typename: z.literal('Repository'),
  pull: z
    .object({
      pullId: z.number(),
      title: z.string().nullable(),
      state: z.union([
        z.literal('OPEN'),
        z.literal('CLOSED'),
        z.literal('MERGED'),
      ]),
      author: z
        .object({
          username: z.string().nullable(),
        })
        .nullable(),
      head: z
        .object({
          branchName: z.string().nullable(),
          ciPassed: z.boolean().nullable(),
        })
        .nullable(),
      updatestamp: z.string().nullable(),
      compareWithBase: CompareWithBaseSchema.nullable(),
    })
    .nullable(),
})

const PullHeadDataSchema = z.object({
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

const query = `
  query PullHeadDataTeam($owner: String!, $repo: String!, $pullId: Int!) {
    owner(username: $owner) {
      repository(name: $repo) {
        __typename
        ... on Repository {
          pull(id: $pullId) {
            pullId
            title
            state
            author {
              username
            }
            head {
              branchName
              ciPassed
            }
            updatestamp
            compareWithBase {
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

interface PullHeadDataTeamQueryArgs {
  provider: string
  owner: string
  repo: string
  pullId: string
}

export const PullHeadDataTeamQueryOpts = ({
  provider,
  owner,
  repo,
  pullId,
}: PullHeadDataTeamQueryArgs) =>
  queryOptionsV5({
    queryKey: ['PullHeaderTeam', provider, owner, repo, pullId, query],
    queryFn: ({ signal }) =>
      Api.graphql({
        provider,
        query,
        signal,
        variables: {
          provider,
          owner,
          repo,
          pullId: parseInt(pullId, 10),
        },
      }).then((res) => {
        const parsedData = PullHeadDataSchema.safeParse(res?.data)

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
                  {/* @ts-expect-error - A hasn't been typed yet */}
                  <A to={{ pageName: 'membersTab' }}>click here </A> to activate
                  your account.
                </p>
              ),
            },
          })
        }

        return {
          pull: data?.owner?.repository?.pull ?? null,
        }
      }),
  })
