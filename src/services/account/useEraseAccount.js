import { useMutation } from '@tanstack/react-query'
import Cookie from 'js-cookie'

import Api from 'shared/api'
import { ProviderCookieKeyMapping } from 'shared/api/helpers'

function getPathAccountDetails({ provider, owner }) {
  return `/${provider}/${owner}/account-details/`
}

export function useEraseAccount({ provider, owner }) {
  return useMutation(
    () => {
      const path = getPathAccountDetails({ provider, owner })

      return Api.delete({
        provider,
        path,
      })
    },
    {
      onSuccess: () => {
        // clear cookie and redirect to homepage
        const cookieTokenName = ProviderCookieKeyMapping[provider]
        Cookie.remove(cookieTokenName)
        window.location.href = '/'
      },
    }
  )
}
