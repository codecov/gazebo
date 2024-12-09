import { queryOptions as queryOptionsV5 } from '@tanstack/react-queryV5'
import { z } from 'zod'

import {
  RepoNotFoundErrorSchema,
  RepoOwnerNotActivatedErrorSchema,
} from 'services/repo'
import Api from 'shared/api'
import { rejectNetworkError } from 'shared/api/helpers'

const RepositorySchema = z.object({
  __typename: z.literal('Repository'),
  name: z.string(),
})

const RequestSchema = z.object({
  owner: z
    .object({
      isCurrentUserPartOfOrg: z.boolean(),
      repository: z.discriminatedUnion('__typename', [
        RepositorySchema,
        RepoNotFoundErrorSchema,
        RepoOwnerNotActivatedErrorSchema,
      ]),
    })
    .nullable(),
})

const query = `
query NavigatorData($username: String!, $repo: String!) {
  owner(username: $username) {
    isCurrentUserPartOfOrg
    repository(name: $repo) {
      __typename
      ... on Repository {
        name
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

interface NavigatorDataQueryArgs {
  provider: string
  owner: string
  repo: string
}

export const NavigatorDataQueryOpts = ({
  provider,
  owner,
  repo,
}: NavigatorDataQueryArgs) => {
  return queryOptionsV5({
    queryKey: ['navigatorData', provider, owner, repo],
    queryFn: () => {
      return Api.graphql({
        provider,
        query,
        variables: {
          username: owner,
          repo,
        },
      }).then((res) => {
        const parsedData = RequestSchema.safeParse(res.data)

        if (!parsedData.success) {
          return rejectNetworkError({
            status: 404,
            data: {},
            dev: 'NavigatorDataQueryOpts - 404 Failed to parse data',
            error: parsedData.error,
          })
        }

        const hasRepoAccess =
          parsedData.data.owner?.repository?.__typename !== 'NotFoundError'

        return {
          isCurrentUserPartOfOrg: parsedData.data.owner?.isCurrentUserPartOfOrg,
          hasRepoAccess,
        }
      })
    },
  })
}
