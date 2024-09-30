import { useQuery, UseQueryOptions } from '@tanstack/react-query'
import { z } from 'zod'

import {
  RepoNotFoundErrorSchema,
  RepoOwnerNotActivatedErrorSchema,
} from 'services/repo'
import Api from 'shared/api'
import A from 'ui/A'

const BranchComponentsSchema = z
  .object({
    head: z
      .object({
        coverageAnalytics: z.object({
          components: z.array(
            z.object({
              id: z.string(),
              name: z.string(),
            })
          ),
        }),
      })
      .nullable(),
  })
  .nullable()

type BranchComponentsData = z.infer<typeof BranchComponentsSchema>

const GetBranchComponentsSchema = z.object({
  owner: z
    .object({
      repository: z
        .discriminatedUnion('__typename', [
          z.object({
            __typename: z.literal('Repository'),
            branch: BranchComponentsSchema,
          }),
          RepoNotFoundErrorSchema,
          RepoOwnerNotActivatedErrorSchema,
        ])
        .nullable(),
    })
    .nullable(),
})

interface UseBranchComponentsArgs {
  provider: string
  owner: string
  repo: string
  branch: string
  filters?: {
    components?: string[]
  }
  opts?: UseQueryOptions<{ branch: BranchComponentsData }>
}

const query = `
query GetBranchComponents($owner: String!, $repo: String!, $branch: String!, $filters: ComponentsFilters) {
  owner(username: $owner) {
    repository(name: $repo) {
      __typename
      ... on Repository {
        branch(name: $branch) {
          head {
            coverageAnalytics {
              components (filters: $filters) {
                id
                name
              }
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

export const useBranchComponents = ({
  provider,
  owner,
  repo,
  branch,
  filters,
  opts,
}: UseBranchComponentsArgs) =>
  useQuery({
    queryKey: [
      'GetBranchComponents',
      provider,
      owner,
      repo,
      branch,
      filters,
      query,
    ],
    queryFn: ({ signal }) =>
      Api.graphql({
        provider,
        query,
        signal,
        variables: {
          owner,
          repo,
          branch,
          filters,
        },
      }).then((res) => {
        const parsedData = GetBranchComponentsSchema.safeParse(res?.data)

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
          branch: data?.owner?.repository?.branch ?? null,
        }
      }),
    ...(!!opts && opts),
  })
