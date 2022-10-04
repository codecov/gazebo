import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'

import Api from 'shared/api'

function fetchRepoFlagsCount({ provider, owner, repo }) {
  const query = `
    query FlagsCount($name: String!, $repo: String!){
      owner(username:$name){
        repository(name:$repo){
           flagsCount
        }
      }
    }
`
  return Api.graphql({
    provider,
    repo,
    query,
    variables: {
      name: owner,
      repo,
    },
  }).then((res) => {
    return {
      flagsCount: res?.data?.owner?.repository?.flagsCount || 0,
    }
  })
}

export function useRepoFlagsCount() {
  const { provider, owner, repo } = useParams()

  return useQuery(['FlagsCount', provider, owner, repo], () => {
    return fetchRepoFlagsCount({ provider, owner, repo })
  })
}
