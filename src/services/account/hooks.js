import { useQuery, useMutation } from 'react-query'

import Api from 'shared/api'

function getPathAccountDetails({ provider, owner }) {
  return `/${provider}/${owner}/account-details/`
}

function fetchAccountDetails({ provider, owner }) {
  const path = getPathAccountDetails({ provider, owner })
  return Api.get({ path, provider })
}

function fetchPlan(provider) {
  const path = `/plans`
  return Api.get({ path, provider })
}

function cancelPlan({ provider, owner }) {
  const path = getPathAccountDetails({ provider, owner })
  const data = {
    plan: {
      value: 'users-free',
    },
  }
  return Api.patch({ path, provider, data })
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

export function useCancelPlan({ provider, owner, ...rest }) {
  return useMutation(() => cancelPlan({ provider, owner }), rest)
}
