import { useMutation as useMutationV5 } from '@tanstack/react-queryV5'
import { z } from 'zod'

import Api from 'shared/api'
import { rejectNetworkError } from 'shared/api/rejectNetworkError'

const UpdateBundleCacheInputSchema = z.array(
  z.object({
    bundleName: z.string(),
    toggleCaching: z.boolean(),
  })
)

const UpdateBundleCacheOutputSchema = z.array(
  z.object({
    bundleName: z.string(),
    cacheConfig: z.boolean(),
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
      results: UpdateBundleCacheOutputSchema.nullable(),
      error: MutationErrorSchema.nullable(),
    })
    .nullable(),
})

const query = `mutation UpdateBundleCacheConfig(
  $owner: String!
  $repo: String!
  $bundles: [BundleCacheConfigInput!]!
) {
  updateBundleCacheConfig(
    input: { owner: $owner, repoName: $repo, bundles: $bundles }
  ) {
    results {
      bundleName
      cacheConfig
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
      const callingFn = 'useUpdateBundleCache'
      const parsedInput = UpdateBundleCacheInputSchema.safeParse(input)

      if (!parsedInput.success) {
        return rejectNetworkError({
          errorName: 'Parsing Error',
          errorDetails: { callingFn, error: parsedInput.error },
        })
      }

      return Api.graphqlMutation({
        provider,
        query,
        variables: { owner, repo, bundles: parsedInput.data },
        mutationPath: 'updateBundleCache',
      }).then((res) => {
        const parsedData = MutationRequestSchema.safeParse(res.data)

        if (!parsedData.success) {
          return rejectNetworkError({
            errorName: 'Parsing Error',
            errorDetails: { callingFn, error: parsedData.error },
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
