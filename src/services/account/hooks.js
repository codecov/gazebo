import { useQuery } from 'react-query'

import Api from 'shared/api'

export function useAccountDetails({ provider, owner }) {
  return useQuery(['accountDetails', provider, owner], (_, provider, owner) => {
    const path = `/${provider}/${owner}/account-details/`
    return Api.get({ path, provider }).then((res) => res.data)
  })
}
