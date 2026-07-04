import { useMutation } from '@tanstack/react-query'
import Cookie from 'js-cookie'

import { useAddNotification } from 'services/toastNotification/context'
import Api from 'shared/api'
import { type Provider, ProviderCookieKeyMapping } from 'shared/api/helpers'

const query = `
  mutation DeleteOwner($input: DeleteOwnerInput!) {
    deleteOwner(input: $input) {
      error {
        __typename
        ... on UnauthenticatedError {
          message
        }
        ... on UnauthorizedError {
          message
        }
        ... on NotFoundError {
          message
        }
      }
    }
  }
`

interface UseEraseAccountArgs {
  provider: Provider
  owner: string
}

export function useEraseAccount({ provider, owner }: UseEraseAccountArgs) {
  const addToast = useAddNotification()

  return useMutation({
    mutationFn: () =>
      Api.graphqlMutation({
        provider,
        query,
        variables: { input: { username: owner } },
        mutationPath: 'deleteOwner',
      }),
    onSuccess: () => {
      // The account is gone, so clear the auth cookie and send the user home.
      const cookieTokenName = ProviderCookieKeyMapping[provider]
      Cookie.remove(cookieTokenName)
      window.location.href = '/'
    },
    onError: () => {
      addToast({
        type: 'error',
        text: 'Something went wrong while deleting the account. Please try again.',
      })
    },
  })
}
