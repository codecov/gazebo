import { useQuery } from '@tanstack/react-query'

import Api from 'shared/api'

const fetchServiceProviders = ({ signal }) => {
  const query = `
    query GetServiceProviders {
      config {
        loginProviders
      }
    }
  `

  return Api.graphql({
    provider: 'gh',
    signal,
    query,
  }).then((res) => {
    const loginProviders = res?.data?.config?.loginProviders
    return {
      providerList: loginProviders,
      github:
        loginProviders?.includes('GITHUB') ||
        loginProviders?.includes('GITHUB_ENTERPRISE'),
      gitlab:
        loginProviders?.includes('GITLAB') ||
        loginProviders.includes('GITLAB_ENTERPRISE'),
      bitbucket:
        loginProviders?.includes('BITBUCKET') ||
        loginProviders?.includes('BITBUCKET_SERVER'),
    }
  })
}

export const useServiceProviders = () => {
  return useQuery({
    queryKey: ['GetServiceProviders'],
    queryFn: ({ signal }) => fetchServiceProviders({ signal }),
  })
}
