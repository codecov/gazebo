import { queryOptions as queryOptionsV5 } from '@tanstack/react-queryV5'
import { z } from 'zod'

import Api from 'shared/api'
import { rejectNetworkError } from 'shared/api/helpers'
import { ErrorCodeEnum } from 'shared/utils/commit'
import { mapEdges } from 'shared/utils/graphql'

const UploadErrorCodeEnumSchema = z.nativeEnum(ErrorCodeEnum)

const UploadErrorSchema = z.object({
  errorCode: UploadErrorCodeEnumSchema.nullable(),
})

const ErrorsSchema = z.object({
  edges: z.array(z.object({ node: UploadErrorSchema }).nullable()),
})

const UploadSchema = z.object({
  errors: ErrorsSchema.nullable(),
})

const UploadsSchema = z.object({
  edges: z.array(z.object({ node: UploadSchema }).nullable()),
})

const HeadSchema = z.object({
  uploads: UploadsSchema.nullable(),
})

const BranchSchema = z.object({
  head: HeadSchema.nullable(),
})

const RepositorySchema = z.object({
  __typename: z.literal('Repository'),
  branch: BranchSchema.nullable(),
})

const OwnerSchema = z.object({
  repository: RepositorySchema.nullable(),
})

export const CommitUploadsQueryOptsSchema = z.object({
  owner: OwnerSchema.nullable(),
})

export type CommitUploadsQueryOptsType = z.infer<
  typeof CommitUploadsQueryOptsSchema
>

const query = `
query CommitUploads($owner: String!, $repo: String!, $branch: String!) {
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
      ... on OwnerNotActivatedError {
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

export const CommitUploadsQueryOpts = ({
  provider,
  owner,
  repo,
  branch,
}: CommitUploadsQueryArgs) =>
  queryOptionsV5({
    queryKey: ['CommitUploads', provider, owner, repo, branch, query],
    queryFn: ({ signal }) =>
      Api.graphql({
        provider,
        query,
        signal,
        variables: { owner, repo, branch },
      }).then((res) => {
        const parsedRes = CommitUploadsQueryOptsSchema.safeParse(res?.data)

        if (!parsedRes.success) {
          return rejectNetworkError({
            status: 404,
            data: {},
            dev: 'CommitUploadsQueryOpts - 404 Failed to parse schema',
            error: parsedRes.error,
          })
        }

        const data = parsedRes.data
        if (data?.owner?.repository?.__typename !== 'Repository') {
          return rejectNetworkError({
            status: 404,
            data: {},
            dev: 'CommitUploadsQueryOpts - 404 Repository not found',
          })
        }

        const uploads = mapEdges(data?.owner?.repository?.branch?.head?.uploads)

        return { uploads }
      }),
  })
