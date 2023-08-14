import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'

import {
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
import { userHasAccess } from 'shared/utils/user'
import A from 'ui/A'

const RepositorySchema = z.object({
  __typename: z.literal('Repository'),
  private: z.boolean(),
  pull: z
    .object({
      pullId: z.number().nullable(),
      head: z
        .object({
          commitid: z.string().nullable(),
        })
        .nullable(),
      compareWithBase: z
        .discriminatedUnion('__typename', [
          z.object({
            __typename: z.literal('Comparison'),
            impactedFilesCount: z.number(),
            indirectChangedFilesCount: z.number(),
            directChangedFilesCount: z.number(),
            flagComparisonsCount: z.number(),
            componentComparisonsCount: z.number(),
          }),
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
  isCurrentUserPartOfOrg: z.boolean(),
  repository: z.discriminatedUnion('__typename', [
    RepositorySchema,
    RepoNotFoundErrorSchema,
    RepoOwnerNotActivatedErrorSchema,
  ]),
})

const query = `
query PullPageData($owner: String!, $repo: String!, $pullId: Int!) {
  owner(username: $owner) {
    isCurrentUserPartOfOrg
    repository(name: $repo) {
      __typename
      ... on Repository {
        private
        pull(id: $pullId) {
          pullId
          head {
            commitid
          }
          compareWithBase {
            __typename
            ... on Comparison {
              impactedFilesCount
              indirectChangedFilesCount
              directChangedFilesCount
              flagComparisonsCount
              componentComparisonsCount
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
}

export const usePullPageData = ({
  provider,
  owner,
  repo,
  pullId,
}: UsePullPageDataArgs) =>
  useQuery({
    queryKey: ['PullPageData', provider, owner, repo, pullId, query],
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
        const parsedData = PullPageDataSchema.safeParse(res?.data?.owner)

        if (!parsedData.success) {
          return Promise.reject({
            status: 404,
            data: {},
          })
        }

        const data = parsedData.data

        if (data?.repository?.__typename === 'NotFoundError') {
          return Promise.reject({
            status: 404,
            data: {},
          })
        }

        if (data?.repository?.__typename === 'OwnerNotActivatedError') {
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
          hasAccess: userHasAccess({
            privateRepo: data?.repository?.private,
            isCurrentUserPartOfOrg: data?.isCurrentUserPartOfOrg,
          }),
          pull: data?.repository?.pull,
        }
      }),
  })
