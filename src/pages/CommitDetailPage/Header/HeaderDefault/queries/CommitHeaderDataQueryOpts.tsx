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
  commit: z
    .object({
      author: z
        .object({
          username: z.string().nullable(),
        })
        .nullable(),
      branchName: z.string().nullable(),
      ciPassed: z.boolean().nullable(),
      commitid: z.string(),
      createdAt: z.string(),
      message: z.string().nullable(),
      pullId: z.number().nullable(),
    })
    .nullable(),
})

export const CommitHeaderDataSchema = z.object({
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

interface CommitHeaderDataQueryArgs {
  provider: string
  owner: string
  repo: string
  commitId: string
}

export const CommitHeaderDataQueryOpts = ({
  provider,
  owner,
  repo,
  commitId,
}: CommitHeaderDataQueryArgs) =>
  queryOptionsV5({
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
      }).then((res) => {
        const callingFn = 'CommitHeaderDataQueryOpts'
        const parsedData = CommitHeaderDataSchema.safeParse(res?.data)

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
          commit: data?.owner?.repository?.commit ?? null,
        }
      }),
  })
