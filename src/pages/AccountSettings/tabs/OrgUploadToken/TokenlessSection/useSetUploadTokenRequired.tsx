import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'

import { useAddNotification } from 'services/toastNotification'
import Api from 'shared/api'

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
  }
`

interface URLParams {
  provider: string
  owner: string
}

export const useSetUploadTokenRequired = () => {
  const { provider, owner } = useParams<URLParams>()
  const addToast = useAddNotification()
  const queryClient = useQueryClient()

  return useMutation({
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
      queryClient.invalidateQueries(['GetUploadTokenRequired'])
      const error = data?.setUploadTokenRequired?.error
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
