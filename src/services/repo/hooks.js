import { useQuery } from 'react-query'

import Api from 'shared/api'
import { providerToName } from 'shared/utils'

function getRepoPath({ provider, owner, repo }) {
  return `/${providerToName(provider).toLowerCase()}/${owner}/repos/${repo}`
}

function fetchRepoDetails({ provider, owner, repo, query }) {
  const path = getRepoPath({ provider, owner, repo })
  return Api.get({ path, provider, repo, query })
}

export function useRepo({ provider, owner, repo, query, opts = {} }) {
  return useQuery(
    [provider, owner, repo, query],
    () => {
      return fetchRepoDetails({ provider, owner, repo, query })
    },
    opts
  )
}
