import { useQuery } from 'react-query'

import Api from 'shared/api'

const fetchServiceProviders = () => {
  const query = `
    query GetServiceProviders {
      loginProviders {
        github
        gitlab
        bitbucket
      }
    }
  `

  return Api.graphql({
    provider: 'gh',
    query,
  }).then((res) => ({
    github: res?.data?.loginProviders?.github,
    gitlab: res?.data?.loginProviders?.gitlab,
    bitbucket: res?.data?.loginProviders?.bitbucket,
  }))
}

export const useServiceProviders = () => {
  return useQuery(['GetServiceProviders'], () => fetchServiceProviders())
}
