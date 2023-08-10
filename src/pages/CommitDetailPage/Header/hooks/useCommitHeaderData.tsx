import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'

import Api from 'shared/api'
import A from 'ui/A/A'

const RepositorySchema = z.object({
  __typename: z.literal('Repository'),
  commit: z
    .object({
      author: z
        .object({
          username: z.string().nullable(),
        })
        .nullable(),
      branchName: z.string().nullable(),
      ciPassed: z.boolean().nullable(),
      commitid: z.string().nullable(),
      createdAt: z.string().nullable(),
      message: z.string().nullable(),
      pullId: z.number().nullable(),
    })
    .nullable(),
})

export const CommitHeaderDataSchema = z.object({
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
  ]),
})

export type CommitHeaderData = z.infer<typeof CommitHeaderDataSchema>

const query = `
  query CommitPageHeaderData(
    $owner: String!
    $repo: String!
    $commitId: String!
  ) {
    owner(username: $owner) {
      repository(name: $repo) {
        __typename
        ... on Repository {
          commit(id: $commitId) {
            author {
              username
            }
            branchName
            ciPassed
            commitid
            createdAt
            message
            pullId
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

interface UseCommitHeaderDataArgs {
  provider: string
  owner: string
  repo: string
  commitId: string
}

export const useCommitHeaderData = ({
  provider,
  owner,
  repo,
  commitId,
}: UseCommitHeaderDataArgs) =>
  useQuery({
    queryKey: ['CommitPageHeaderData', provider, owner, repo, commitId, query],
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
        // eslint-disable-next-line max-statements
      }).then((res) => {
        const parsedData = CommitHeaderDataSchema.safeParse(res?.data?.owner)

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
          commit: data?.repository?.commit,
        }
      }),
  })
