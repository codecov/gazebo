import { useQuery } from '@tanstack/react-query'

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
  }).then((res) => ({
    providerList: res?.data?.loginProviders,
    github:
      res?.data?.loginProviders?.includes('GITHUB') ||
      res?.data?.loginProviders?.includes('GITHUB_ENTERPRISE'),
    gitlab:
      res?.data?.loginProviders?.includes('GITLAB') ||
      res?.data?.loginProviders.includes('GITLAB_ENTERPRISE'),
    bitbucket:
      res?.data?.loginProviders?.includes('BITBUCKET') ||
      res?.data?.loginProviders?.includes('BITBUCKET_SERVER'),
  }))
}

export const useServiceProviders = () => {
  return useQuery(['GetServiceProviders'], () => fetchServiceProviders())
}
