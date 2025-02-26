import { queryOptions as queryOptionsV5 } from '@tanstack/react-queryV5'
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
  pull: z
    .object({
      pullId: z.number(),
      title: z.string().nullable(),
      state: z.union([
        z.literal('OPEN'),
        z.literal('CLOSED'),
        z.literal('MERGED'),
      ]),
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

interface PullHeadDataQueryArgs {
  provider: string
  owner: string
  repo: string
  pullId: string
}

export const PullHeadDataQueryOpts = ({
  provider,
  owner,
  repo,
  pullId,
}: PullHeadDataQueryArgs) =>
  queryOptionsV5({
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
        const callingFn = 'PullHeadDataQueryOpts'
        const parsedData = PullHeadDataSchema.safeParse(res?.data)

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
                  {/* @ts-expect-error - A hasn't been typed yet */}
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
