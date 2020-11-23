import { useQuery } from 'react-query'

import Api from 'shared/api'

function fetchAccountDetails({ provider, owner }) {
  const path = `/${provider}/${owner}/account-details/`
  return Api.get({ path, provider }).then((res) => res.data)
}

function fetchPlan(provider) {
  const path = `/plans`
  return Api.get({ path, provider }).then((res) => res.data)
}

export function useAccountDetails({ provider, owner }) {
  return useQuery(['accountDetails', provider, owner], (_, provider, owner) => {
    return fetchAccountDetails({ provider, owner })
  })
}

export function useAccountsAndPlans({ provider, owner }) {
  return useQuery(
    ['accountDetails-and-plans', provider, owner],
    (_, provider, owner) => {
      return Promise.all([
        fetchAccountDetails({ provider, owner }),
        fetchPlan(provider),
      ]).then((data) => {
        const [accountDetails, plans] = data
        return { accountDetails, plans }
      })
    }
  )
}
