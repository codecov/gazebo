import { useMutation } from '@tanstack/react-query'

import { useAddNotification } from 'services/toastNotification/context'
import Api from 'shared/api'
import A from 'ui/A'

const query = `
  mutation SendSentryToken($state: String!) {
    saveSentryState(input: { state: $state }) {
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

const SentryTokenErrorMessage = () => (
  <p>
    Looks like something weird happened.{' '}
    <A to={{ pageName: 'sales' }} hook="contact-sales" isExternal={true}>
      Contact us
    </A>{' '}
    and we&apos;ll help you out.
  </p>
)

export const useSentryToken = ({ provider }: { provider: string }) => {
  const addToast = useAddNotification()
  return useMutation({
    mutationFn: (token: string) => {
      return Api.graphqlMutation({
        provider,
        query,
        variables: {
          state: token,
        },
        mutationPath: 'saveSentryState',
      })
    },
    onSuccess: ({ data }) => {
      const error = data?.saveSentryState?.error
      if (error) {
        if (error?.__typename === 'ValidationError') {
          addToast({
            type: 'error',
            text: <SentryTokenErrorMessage />,
            disappearAfter: 10000,
          })
        } else if (error?.__typename === 'UnauthenticatedError') {
          addToast({
            type: 'error',
            text: <SentryTokenErrorMessage />,
            disappearAfter: 10000,
          })
        }
      }
    },
    onError: () => {
      addToast({
        type: 'error',
        text: <SentryTokenErrorMessage />,
        disappearAfter: 10000,
      })
    },
    onSettled: () => {
      localStorage.removeItem('sentry-token')
    },
    retry: false,
  })
}
