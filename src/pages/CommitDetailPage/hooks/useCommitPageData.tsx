import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'

import Api from 'shared/api'
import A from 'ui/A/A'

const RepositorySchema = z.object({
  __typename: z.literal('Repository'),
  commit: z
    .object({
      commitid: z.string(),
    })
    .nullable(),
})

const CommitPageDataSchema = z.object({
  isCurrentUserPartOfOrg: z.boolean(),
  repository: z.discriminatedUnion('__typename', [
    RepositorySchema,
    z.object({
      __typename: z.literal('NotFoundError'),
      message: z.string(),
    }),
    z.object({
      __typename: z.literal('OwnerNotActivatedError'),
      message: z.string(),
    }),
    z.object({
      __typename: z.literal('ResolverError'),
      message: z.string(),
    }),
  ]),
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
        ... on ResolverError {
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
        // eslint-disable-next-line max-statements, complexity
      }).then((res) => {
        const parsedData = CommitPageDataSchema.safeParse(res?.data?.owner)

        if (!parsedData.success) {
          return Promise.reject({
            status: 404,
            data: {},
          })
        }

        const { data } = parsedData
        const isCurrentUserPartOfOrg = data?.isCurrentUserPartOfOrg

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

        if (data?.repository?.__typename === 'ResolverError') {
          return Promise.reject({
            status: 500,
            data: {},
          })
        }

        return {
          isCurrentUserPartOfOrg,
          commit: data?.repository?.commit,
        }
      }),
  })
