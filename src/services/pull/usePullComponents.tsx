import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
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

const query = `
  query PullComponentsSelector(
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

const RepositorySchema = z.object({
  __typename: z.literal('Repository'),
  pull: z
    .object({
      compareWithBase: z.discriminatedUnion('__typename', [
        z.object({
          __typename: z.literal('Comparison'),
          componentComparisons: z
            .array(
              z.object({
                name: z.string(),
              })
            )
            .nullable(),
        }),
        FirstPullRequestSchema,
        MissingBaseCommitSchema,
        MissingBaseReportSchema,
        MissingComparisonSchema,
        MissingHeadCommitSchema,
        MissingHeadReportSchema,
      ]),
    })
    .nullable(),
})

const PullComponentsSchema = z.object({
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

interface URLParams {
  provider: string
  owner: string
  repo: string
  pullId: string
}

interface Filters {
  components?: string[]
}

interface PullComponentsProps {
  filters?: Filters
  options?: {
    suspense?: boolean
  }
}

export function usePullComponents({
  filters,
  options,
}: PullComponentsProps = {}) {
  const { provider, owner, repo, pullId } = useParams<URLParams>()

  return useQuery({
    queryKey: [
      'PullComponentsSelector',
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
          provider,
          owner,
          repo,
          filters,
          pullId: parseInt(pullId, 10),
        },
      }).then((res) => {
        const parsedData = PullComponentsSchema.safeParse(res?.data)

        if (!parsedData.success) {
          return Promise.reject({
            status: 404,
            data: {
              message: 'Error parsing pull components selector data',
            },
          })
        }

        const data = parsedData.data

        if (data?.owner?.repository?.__typename === 'NotFoundError') {
          return Promise.reject({
            status: 404,
            data: {
              message: 'Repo not found',
            },
          })
        }

        if (data?.owner?.repository?.__typename === 'OwnerNotActivatedError') {
          return Promise.reject({
            status: 403,
            data: {
              detail: (
                <p>
                  Activation is required to view this repo, please{' '}
                  <A
                    to={{ pageName: 'membersTab' }}
                    hook="members-page-link"
                    isExternal={false}
                  >
                    click here{' '}
                  </A>{' '}
                  to activate your account.
                </p>
              ),
            },
          })
        }

        return {
          pull: data?.owner?.repository?.pull,
        }
      }),
    ...options,
  })
}
