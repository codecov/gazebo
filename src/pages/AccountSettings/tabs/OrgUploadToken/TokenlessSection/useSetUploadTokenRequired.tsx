import { useQueryClient } from '@tanstack/react-query'
import { useMutation as useMutationV5 } from '@tanstack/react-queryV5'
import { z } from 'zod'

import { useAddNotification } from 'services/toastNotification'
import Api from 'shared/api'
import { Provider, rejectNetworkError } from 'shared/api/helpers'

const TOAST_DURATION = 10000

const query = `
mutation SetUploadTokenRequired($input: SetUploadTokenRequiredInput!) {
  setUploadTokenRequired(input: $input) {
    error {
      __typename
      ... on ValidationError {
        message
      }
      ... on UnauthorizedError {
        message
      }
      ... on UnauthenticatedError {
        message
      }
    }
  }
}`

const ErrorUnionSchema = z.discriminatedUnion('__typename', [
  z.object({
    __typename: z.literal('UnauthorizedError'),
    message: z.string(),
  }),
  z.object({
    __typename: z.literal('ValidationError'),
    message: z.string(),
  }),
  z.object({
    __typename: z.literal('UnauthenticatedError'),
    message: z.string(),
  }),
])

const ResponseSchema = z.object({
  setUploadTokenRequired: z
    .object({ error: ErrorUnionSchema.nullable() })
    .nullable(),
})

interface UseSetUploadTokenRequiredArgs {
  provider: Provider
  owner: string
}

export const useSetUploadTokenRequired = ({
  provider,
  owner,
}: UseSetUploadTokenRequiredArgs) => {
  const addToast = useAddNotification()
  const queryClient = useQueryClient()

  return useMutationV5({
    mutationFn: (uploadTokenRequired: boolean) => {
      return Api.graphqlMutation({
        provider,
        query,
        variables: {
          input: {
            orgUsername: owner,
            uploadTokenRequired,
          },
        },
        mutationPath: 'setUploadTokenRequired',
      })
    },
    onSuccess: ({ data }) => {
      const parsedData = ResponseSchema.safeParse(data)
      if (!parsedData.success) {
        return rejectNetworkError({
          status: 404,
          data: {},
          dev: 'useSetUploadTokenRequired - 404 failed to parse',
          error: parsedData.error,
        })
      }

      const error = parsedData?.data?.setUploadTokenRequired?.error
      if (error) {
        addToast({
          type: 'error',
          text: error?.message || 'Failed to set upload token requirement',
          disappearAfter: TOAST_DURATION,
        })
      } else {
        addToast({
          type: 'success',
          text: 'Upload token requirement updated successfully',
          disappearAfter: TOAST_DURATION,
        })

        // only want to invalidate the query if the mutation was successful
        // otherwise we're just going to re-fetch the same data
        queryClient.invalidateQueries(['GetUploadTokenRequired'])
      }
    },
    onError: () => {
      addToast({
        type: 'error',
        text: 'An error occurred while updating upload token requirement',
        disappearAfter: TOAST_DURATION,
      })
    },
    retry: false,
  })
}
