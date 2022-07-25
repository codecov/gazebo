import { useQuery } from 'react-query'

import Api from 'shared/api'

const fetchServiceProviders = () => {
  const query = `
    query GetServiceProviders {
      loginProviders
    }
  `

  return Api.graphql({
    provider: 'gh',
    query,
  }).then((res) => res?.data?.loginProviders)
}

export const useServiceProviders = () => {
  return useQuery(['GetServiceProviders'], () => fetchServiceProviders())
}
