import { useMutation, useQuery, useQueryClient } from 'react-query'
import { useParams } from 'react-router-dom'

import Api from 'shared/api'
import { providerToName } from 'shared/utils'

function fetchRepoDetails({ provider, owner, repo }) {
  const query = `
    query GetRepo($name: String!, $repo: String!){
      owner(username:$name){
        isCurrentUserPartOfOrg
        repository(name:$repo){
          private
          uploadToken
          defaultBranch
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
      repository: res?.data?.owner?.repository,
      isCurrentUserPartOfOrg: res?.data?.owner?.isCurrentUserPartOfOrg,
    }
  })
}

export function useRepo({ provider, owner, repo }) {
  return useQuery([provider, owner, repo], () => {
    return fetchRepoDetails({ provider, owner, repo })
  })
}

//update repo hook
function getRepoPath({ provider, owner, repo }) {
  return `/${provider}/${owner}/repos/${repo}/`
}

function updateRepo({ provider, owner, repo, body }) {
  const refactoredProvider = providerToName(provider).toLowerCase()
  const path = getRepoPath({
    provider: refactoredProvider,
    owner,
    repo,
  })
  return Api.patch({ path, provider: refactoredProvider, body })
}

export function useUpdateRepo() {
  const { provider, owner, repo } = useParams()
  const queryClient = useQueryClient()
  return useMutation(
    ({ ...body }) => updateRepo({ provider, owner, repo, body }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('GetRepo')
      },
    }
  )
}
