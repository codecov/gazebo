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
  pull: z
    .object({
      pullId: z.number().nullable(),
      title: z.string().nullable(),
      state: z
        .union([z.literal('OPEN'), z.literal('CLOSED'), z.literal('MERGED')])
        .nullable(),
      author: z
        .object({
          username: z.string().nullable(),
        })
        .nullable(),
      head: z
        .object({
          branchName: z.string().nullable(),
          ciPassed: z.boolean().nullable(),
        })
        .nullable(),
      updatestamp: z.string().nullable(),
    })
    .nullable(),
})

const PullHeadDataSchema = z.object({
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
  query PullHeadData($owner: String!, $repo: String!, $pullId: Int!) {
    owner(username: $owner) {
      repository(name: $repo) {
        __typename
        ... on Repository {
          pull(id: $pullId) {
            pullId
            title
            state
            author {
              username
            }
            head {
              branchName
              ciPassed
            }
            updatestamp
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

interface UsePullHeadDataArgs {
  provider: string
  owner: string
  repo: string
  pullId: string
}

export const usePullHeadData = ({
  provider,
  owner,
  repo,
  pullId,
}: UsePullHeadDataArgs) =>
  useQuery({
    queryKey: ['PullHeader', provider, owner, repo, pullId, query],
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
        const parsedData = PullHeadDataSchema.safeParse(res?.data)

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
