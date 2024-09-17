import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { z } from 'zod'

import {
  RepoNotFoundErrorSchema,
  RepoOwnerNotActivatedErrorSchema,
} from 'services/repo'
import Api from 'shared/api'
import { type NetworkErrorObject } from 'shared/api/helpers'
import A from 'ui/A'

const query = `
query RepoComponentsSelector(
  $owner: String!
  $repo: String!
  $termId: String!
) {
  owner(username: $owner) {
    repository(name: $repo) {
      __typename
      ... on Repository {
        coverageAnalytics {
          componentsYaml(termId: $termId) {
            name
            id
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
  componentsYaml: z
    .array(
      z.object({
        name: z.string(),
        id: z.string(),
      })
    )
    .nullable(),
})

const RequestSchema = z.object({
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

interface UseRepoComponentsSelectArgs {
  termId?: string
  opts?: {
    suspense?: boolean
  }
}

export function useRepoComponentsSelect({
  termId = '',
  opts = {},
}: UseRepoComponentsSelectArgs = {}) {
  const { provider, owner, repo } = useParams<{
    provider: string
    owner: string
    repo: string
  }>()

  return useQuery({
    queryKey: ['RepoComponentsSelector', provider, owner, repo, query, termId],
    queryFn: ({ signal }) =>
      Api.graphql({
        provider,
        query,
        signal,
        variables: {
          owner,
          repo,
          termId,
        },
      }).then((res) => {
        const parsedData = RequestSchema.safeParse(res?.data)

        if (!parsedData.success) {
          return Promise.reject({
            status: 404,
            data: {},
            dev: 'useRepoComponentsSelect - 404 Error parsing repo components data',
          } satisfies NetworkErrorObject)
        }

        const data = parsedData.data

        if (data?.owner?.repository?.__typename === 'NotFoundError') {
          return Promise.reject({
            status: 404,
            data: {},
            dev: 'useRepoComponentsSelect - 404 RepoNotFoundError',
          } satisfies NetworkErrorObject)
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
            dev: 'useRepoComponentsSelect - 403 OwnerNotActivatedError',
          } satisfies NetworkErrorObject)
        }

        return { components: data?.owner?.repository?.componentsYaml || [] }
      }),
    ...opts,
  })
}
