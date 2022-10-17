import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'

import Api from 'shared/api'

function fetchRepoBackfilledContents({ provider, owner, repo }) {
  const query = `
      query BackfillFlagMemberships($name: String!, $repo: String!) {
        owner(username:$name){
          repository(name:$repo){
            flagsMeasurementsActive
            flagsMeasurementsBackfilled
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
    return res?.data?.owner?.repository
  })
}

export function useRepoBackfilled() {
  const { provider, owner, repo } = useParams()
  return useQuery(['BackfillFlagMemberships', provider, owner, repo], () => {
    return fetchRepoBackfilledContents({ provider, owner, repo })
  })
}
