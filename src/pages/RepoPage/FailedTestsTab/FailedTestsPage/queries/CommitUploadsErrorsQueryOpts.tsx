import { queryOptions as queryOptionsV5 } from '@tanstack/react-queryV5'
import { z } from 'zod'

import { RepoNotFoundErrorSchema } from 'services/repo'
import Api from 'shared/api'
import { rejectNetworkError } from 'shared/api/helpers'
import { ErrorCodeEnum } from 'shared/utils/commit'
import { mapEdges } from 'shared/utils/graphql'

const UploadsSchema = z.object({
  edges: z.array(
    z
      .object({
        node: z.object({
          errors: z
            .object({
              edges: z.array(
                z
                  .object({
                    node: z.object({
                      errorCode: z.nativeEnum(ErrorCodeEnum).nullable(),
                    }),
                  })
                  .nullable()
              ),
            })
            .nullable(),
        }),
      })
      .nullable()
  ),
})

const RepositorySchema = z.object({
  __typename: z.literal('Repository'),
  branch: z
    .object({
      head: z
        .object({
          uploads: UploadsSchema.nullable(),
        })
        .nullable(),
    })
    .nullable(),
})

export const CommitUploadsErrorsQueryOptsSchema = z.object({
  owner: z
    .object({
      repository: z
        .discriminatedUnion('__typename', [
          RepositorySchema,
          RepoNotFoundErrorSchema,
        ])
        .nullable(),
    })
    .nullable(),
})

const query = `
query CommitUploadsErrors($owner: String!, $repo: String!, $branch: String!) {
  owner(username: $owner) {
    repository(name: $repo) {
      __typename
      ... on Repository {
        branch(name: $branch) {
          head {
            uploads {
              edges {
                node {
                  errors {
                    edges {
                      node {
                        errorCode
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
      ... on NotFoundError {
        message
      }
    }
  }
}
`

interface CommitUploadsQueryArgs {
  provider: string
  owner: string
  repo: string
  branch: string
}

export const CommitUploadsErrorsQueryOpts = ({
  provider,
  owner,
  repo,
  branch,
}: CommitUploadsQueryArgs) =>
  queryOptionsV5({
    queryKey: ['CommitUploadsErrors', provider, owner, repo, branch, query],
    queryFn: ({ signal }) =>
      Api.graphql({
        provider,
        query,
        signal,
        variables: { owner, repo, branch },
      }).then((res) => {
        const parsedRes = CommitUploadsErrorsQueryOptsSchema.safeParse(
          res?.data
        )

        if (!parsedRes.success) {
          return rejectNetworkError({
            status: 404,
            data: {},
            dev: 'CommitUploadsErrorsQueryOpts - 404 Failed to parse schema',
            error: parsedRes.error,
          })
        }

        const data = parsedRes.data
        if (data?.owner?.repository?.__typename === 'NotFoundError') {
          return rejectNetworkError({
            status: 404,
            data: {},
            dev: 'CommitUploadsErrorsQueryOpts - 404 Repository not found',
          })
        }

        return {
          uploads: mapEdges(data?.owner?.repository?.branch?.head?.uploads),
        }
      }),
  })
