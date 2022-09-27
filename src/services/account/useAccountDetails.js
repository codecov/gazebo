import { useQuery } from '@tanstack/react-query'

import Api from 'shared/api'

function getPathAccountDetails({ provider, owner }) {
  return `/${provider}/${owner}/account-details/`
}

function fetchAccountDetails({ provider, owner }) {
  const path = getPathAccountDetails({ provider, owner })
  return Api.get({ path, provider })
}

export function useAccountDetails({ provider, owner, opts = {} }) {
  return useQuery(
    ['accountDetails', provider, owner],
    () => {
      return fetchAccountDetails({ provider, owner })
    },
    opts
  )
}
