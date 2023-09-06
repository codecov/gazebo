import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'

import {
  RepoNotFoundErrorSchema,
  RepoOwnerNotActivatedErrorSchema,
} from 'services/repo'
import Api from 'shared/api'
import A from 'ui/A'

const RepositorySchema = z.object({
  __typename: z.literal('Repository'),
  commit: z
    .object({
      commitid: z.string(),
    })
    .nullable(),
})

const CommitPageDataSchema = z.object({
  owner: z
    .object({
      isCurrentUserPartOfOrg: z.boolean(),
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

export type CommitPageData = z.infer<typeof CommitPageDataSchema>

const query = `
  query CommitPageData($owner: String!, $repo: String!, $commitId: String!) {
    owner(username: $owner) {
      isCurrentUserPartOfOrg
      repository(name: $repo) {
        __typename
        ... on Repository {
          commit(id: $commitId) {
            commitid
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

interface UseCommitPageDataArgs {
  provider: string
  owner: string
  repo: string
  commitId: string
}

export const useCommitPageData = ({
  provider,
  owner,
  repo,
  commitId,
}: UseCommitPageDataArgs) =>
  useQuery({
    queryKey: ['CommitPageData', provider, owner, repo, commitId, query],
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
        const parsedData = CommitPageDataSchema.safeParse(res?.data)

        if (!parsedData.success) {
          return Promise.reject({
            status: 404,
            data: {},
          })
        }

        const { data } = parsedData

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
          isCurrentUserPartOfOrg: data?.owner?.isCurrentUserPartOfOrg ?? null,
          commit: data?.owner?.repository?.commit ?? null,
        }
      }),
  })
