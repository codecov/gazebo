import { useQuery } from '@tanstack/react-query'

import Api from 'shared/api'

function getPathAccountDetails({ provider, owner }) {
  return `/${provider}/${owner}/account-details/`
}

function fetchAccountDetails({ provider, owner, signal }) {
  const path = getPathAccountDetails({ provider, owner })
  return Api.get({ path, provider, signal })
}

export function useAccountDetails({ provider, owner, opts = {} }) {
  return useQuery(
    ['accountDetails', provider, owner],
    ({ signal }) => fetchAccountDetails({ provider, owner, signal }),
    opts
  )
}
