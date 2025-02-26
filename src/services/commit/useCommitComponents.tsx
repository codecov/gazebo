import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { z } from 'zod'

import {
  RepoNotFoundErrorSchema,
  RepoOwnerNotActivatedErrorSchema,
} from 'services/repo'
import Api from 'shared/api'
import { rejectNetworkError } from 'shared/api/rejectNetworkError'
import A from 'ui/A'

const RepositorySchema = z.object({
  __typename: z.literal('Repository'),
  commit: z
    .object({
      coverageAnalytics: z
        .object({
          components: z.array(
            z.object({
              name: z.string(),
            })
          ),
        })
        .nullable(),
    })
    .nullable(),
})

export const CommitComponentsSchema = z.object({
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

export type CommitComponentsData = z.infer<typeof CommitComponentsSchema>

const query = `
  query CommitComponents(
    $owner: String!
    $repo: String!
    $commitId: String!
    $filters: ComponentsFilters
  ) {
    owner(username: $owner) {
      repository(name: $repo) {
        __typename
        ... on Repository {
          commit(id: $commitId) {
            coverageAnalytics {
              components (filters: $filters) {
                name
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

interface URLParams {
  provider: string
  owner: string
  repo: string
  commit: string
}

interface Filters {
  components?: string[]
}

interface CommitComponentsProps {
  filters?: Filters
  options?: {
    suspense?: boolean
  }
}

export function useCommitComponents({
  filters,
  options,
}: CommitComponentsProps = {}) {
  const { provider, owner, repo, commit: commitId } = useParams<URLParams>()

  return useQuery({
    queryKey: [
      'CommitComponents',
      provider,
      owner,
      repo,
      commitId,
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
          commitId,
        },
      }).then((res) => {
        const callingFn = 'useCommitComponents'
        const parsedData = CommitComponentsSchema.safeParse(res?.data)

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
                  <A
                    to={{ pageName: 'membersTab' }}
                    hook="activate-user"
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
          components:
            data?.owner?.repository?.commit?.coverageAnalytics?.components,
        }
      }),
    ...options,
  })
}
