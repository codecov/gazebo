import { queryOptions as queryOptionsV5 } from '@tanstack/react-queryV5'
import { type ParsedQs } from 'qs'
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
import { rejectNetworkError } from 'shared/api/helpers'
import A from 'ui/A'

const ComponentsComparisonSchema = z
  .object({
    name: z.string(),
    patchTotals: z
      .object({
        percentCovered: z.number().nullable(),
      })
      .nullable(),
    headTotals: z.object({ percentCovered: z.number().nullable() }).nullable(),
    baseTotals: z.object({ percentCovered: z.number().nullable() }).nullable(),
  })
  .nullable()

export type ComponentsComparison = z.infer<typeof ComponentsComparisonSchema>

const RepositorySchema = z.object({
  __typename: z.literal('Repository'),
  pull: z
    .object({
      compareWithBase: z.discriminatedUnion('__typename', [
        z.object({
          __typename: z.literal('Comparison'),
          componentComparisons: z.array(ComponentsComparisonSchema).nullable(),
        }),
        FirstPullRequestSchema,
        MissingBaseCommitSchema,
        MissingBaseReportSchema,
        MissingComparisonSchema,
        MissingHeadCommitSchema,
        MissingHeadReportSchema,
      ]),
      head: z
        .object({
          branchName: z.string().nullable(),
        })
        .nullable(),
    })
    .nullable(),
})

const ComponentComparisonSchema = z.object({
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
query PullComponentComparison(
  $owner: String!
  $repo: String!
  $pullId: Int!
  $filters: ComponentsFilters
) {
  owner(username: $owner) {
    repository(name: $repo) {
      __typename
      ... on Repository {
        pull(id: $pullId) {
          compareWithBase {
            __typename
            ... on Comparison {
              componentComparisons(filters: $filters) {
                name
                patchTotals {
                  percentCovered
                }
                headTotals {
                  percentCovered
                }
                baseTotals {
                  percentCovered
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
          head {
            branchName
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

interface ComponentComparisonQueryArgs {
  provider: string
  owner: string
  repo: string
  pullId: string
  filters?: {
    components?: string[] | ParsedQs[]
  }
}

export function ComponentComparisonQueryOpts({
  provider,
  owner,
  repo,
  pullId,
  filters,
}: ComponentComparisonQueryArgs) {
  return queryOptionsV5({
    queryKey: [
      'PullComponentComparison',
      provider,
      owner,
      repo,
      pullId,
      query,
      filters,
    ],
    queryFn: ({ signal }) =>
      Api.graphql({
        provider,
        query,
        signal,
        variables: {
          filters,
          provider,
          owner,
          repo,
          pullId: parseInt(pullId, 10),
        },
      }).then((res) => {
        const parsedRes = ComponentComparisonSchema.safeParse(res?.data)

        if (!parsedRes.success) {
          return rejectNetworkError({
            status: 404,
            data: {},
            dev: `ComponentComparisonQueryOpts - 404 Failed to parse`,
            error: parsedRes.error,
          })
        }

        const data = parsedRes.data

        if (data?.owner?.repository?.__typename === 'NotFoundError') {
          return rejectNetworkError({
            status: 404,
            data: {},
            dev: `ComponentComparisonQueryOpts - 404 Not Found`,
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
            dev: `ComponentComparisonQueryOpts - 403 Owner Not Activated`,
          })
        }

        return { pull: data?.owner?.repository?.pull }
      }),
  })
}
