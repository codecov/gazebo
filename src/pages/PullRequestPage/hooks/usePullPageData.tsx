import { useQuery } from '@tanstack/react-query'
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
import A from 'ui/A'

const RepositorySchema = z.object({
  __typename: z.literal('Repository'),
  pull: z
    .object({
      pullId: z.number(),
      head: z
        .object({
          commitid: z.string(),
        })
        .nullable(),
      compareWithBase: z
        .discriminatedUnion('__typename', [
          z.object({
            __typename: z.literal('Comparison'),
            impactedFilesCount: z.number(),
            indirectChangedFilesCount: z.number().optional(),
            directChangedFilesCount: z.number(),
            flagComparisonsCount: z.number().optional(),
            componentComparisonsCount: z.number().optional(),
          }),
          FirstPullRequestSchema,
          MissingBaseCommitSchema,
          MissingBaseReportSchema,
          MissingComparisonSchema,
          MissingHeadCommitSchema,
          MissingHeadReportSchema,
        ])
        .nullable(),
    })
    .nullable(),
})

const PullPageDataSchema = z.object({
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
query PullPageData($owner: String!, $repo: String!, $pullId: Int!, $isTeamPlan: Boolean!) {
  owner(username: $owner) {
    repository(name: $repo) {
      __typename
      ... on Repository {
        pull(id: $pullId) {
          pullId
          head {
            commitid
          }
          compareWithBase {
            __typename
            ... on Comparison {
              impactedFilesCount
              indirectChangedFilesCount @skip(if: $isTeamPlan)
              directChangedFilesCount
              flagComparisonsCount @skip(if: $isTeamPlan)
              componentComparisonsCount @skip(if: $isTeamPlan)
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

interface UsePullPageDataArgs {
  provider: string
  owner: string
  repo: string
  pullId: string
  isTeamPlan?: boolean
}

export const usePullPageData = ({
  provider,
  owner,
  repo,
  pullId,
  isTeamPlan = false,
}: UsePullPageDataArgs) =>
  useQuery({
    queryKey: [
      'PullPageData',
      provider,
      owner,
      repo,
      pullId,
      isTeamPlan,
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
          pullId: parseInt(pullId, 10),
          isTeamPlan,
        },
      }).then((res) => {
        const parsedData = PullPageDataSchema.safeParse(res?.data)

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
          pull: data?.owner?.repository?.pull ?? null,
        }
      }),
  })
