import { useMutation as useMutationV5 } from '@tanstack/react-queryV5'
import { z } from 'zod'

import Api from 'shared/api'
import { rejectNetworkError } from 'shared/api/helpers'

const UpdateBundleCacheInputSchema = z.array(
  z.object({
    bundleName: z.string(),
    isCached: z.boolean(),
  })
)

const MutationErrorSchema = z.discriminatedUnion('__typename', [
  z.object({
    __typename: z.literal('UnauthenticatedError'),
    message: z.string(),
  }),
  z.object({
    __typename: z.literal('ValidationError'),
    message: z.string(),
  }),
])

const MutationRequestSchema = z.object({
  updateBundleCacheConfig: z
    .object({
      results: UpdateBundleCacheInputSchema.nullable(),
      error: MutationErrorSchema.nullable(),
    })
    .nullable(),
})

const query = `
mutation UpdateBundleCacheConfig(
  $owner: String!
  $repo: String!
  $bundles: [BundleCacheConfigInput!]!
) {
  updateBundleCacheConfig(
    input: { owner: $owner, repoName: $repo, bundles: $bundles }
  ) {
    results {
      bundleName
      isCached
    }
    error {
      __typename
      ... on UnauthenticatedError {
        message
      }
      ... on ValidationError {
        message
      }
    }
  }
}`

interface UseUpdateBundleCacheArgs {
  provider: string
  owner: string
  repo: string
}

export const useUpdateBundleCache = ({
  provider,
  owner,
  repo,
}: UseUpdateBundleCacheArgs) => {
  return useMutationV5({
    throwOnError: false,
    mutationFn: (input: z.infer<typeof UpdateBundleCacheInputSchema>) => {
      return Api.graphqlMutation({
        provider,
        query,
        variables: { owner, repo, bundles: input },
        mutationPath: 'updateBundleCache',
      }).then((res) => {
        const parsedData = MutationRequestSchema.safeParse(res.data)

        if (!parsedData.success) {
          return rejectNetworkError({
            status: 400,
            error: parsedData.error,
            data: {},
            dev: 'useUpdateBundleCache - 400 failed to parse data',
          })
        }

        const updateBundleCacheConfig = parsedData.data.updateBundleCacheConfig
        if (
          updateBundleCacheConfig?.error?.__typename === 'UnauthenticatedError'
        ) {
          return Promise.reject({
            error: 'UnauthenticatedError',
            message: updateBundleCacheConfig?.error?.message,
          })
        }

        if (updateBundleCacheConfig?.error?.__typename === 'ValidationError') {
          return Promise.reject({
            error: 'ValidationError',
            message: updateBundleCacheConfig?.error?.message,
          })
        }

        return updateBundleCacheConfig?.results ?? []
      })
    },
  })
}
