import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'

import { useAddNotification } from 'services/toastNotification'
import Api from 'shared/api'
import A from 'ui/A'

const query = `
  mutation UpdateSelfHostedSettings($shouldAutoActivate: Boolean!) {
    updateSelfHostedSettings(input: { shouldAutoActivate: $shouldAutoActivate }) {
      error {
        ... on UnauthenticatedError {
          __typename
          message
        }
        ... on ValidationError {
          __typename
          message
        }
      }
    }
  }
`

const UpdateSelfHostedSettingsMessage = () => (
  <p>
    Error updating org auto activation.{' '}
    <A to={{ pageName: 'sales' }} hook="support-link" isExternal={true}>
      Contact us
    </A>{' '}
    and we&apos;ll help you out.
  </p>
)

export const useUpdateSelfHostedSettings = () => {
  const { provider } = useParams<{ provider: string }>()
  const addToast = useAddNotification()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (shouldAutoActivate: Boolean) => {
      return Api.graphqlMutation({
        provider,
        query,
        variables: {
          shouldAutoActivate,
        },
        mutationPath: 'updateSelfHostedSettings',
      })
    },
    onSuccess: ({ data }) => {
      const error = data?.saveSentryState?.error
      if (error) {
        if (error?.__typename === 'ValidationError') {
          addToast({
            type: 'error',
            text: <UpdateSelfHostedSettingsMessage />,
            disappearAfter: 10000,
          })
        } else if (error?.__typename === 'UnauthenticatedError') {
          addToast({
            type: 'error',
            text: <UpdateSelfHostedSettingsMessage />,
            disappearAfter: 10000,
          })
        }
      }
    },
    onError: () => {
      addToast({
        type: 'error',
        text: <UpdateSelfHostedSettingsMessage />,
        disappearAfter: 10000,
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries(['SelfHostedSettings'])
    },
    retry: false,
  })
}
