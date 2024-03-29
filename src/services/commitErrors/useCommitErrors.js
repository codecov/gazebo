import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'

import Api from 'shared/api'
import { mapEdges } from 'shared/utils/graphql'

export function useCommitErrors() {
  const { provider, owner, repo, commit: commitid } = useParams()
  const query = `
      query CommitErrors($owner: String!, $repo: String!, $commitid: String!) {
        owner(username: $owner) {
          repository: repositoryDeprecated(name: $repo) {
            commit(id: $commitid) {
              yamlErrors: errors(errorType: YAML_ERROR){
                edges{
                    node{
                        errorCode
                    }
                }
              }
              botErrors: errors(errorType: BOT_ERROR){
                edges{
                    node{
                        errorCode
                    }
                }
              }
            }
          }
        }
      }
    `

  return useQuery({
    queryKey: ['CommitErrors', provider, owner, repo, commitid, query],
    queryFn: ({ signal }) => {
      return Api.graphql({
        provider,
        query,
        signal,
        variables: {
          owner,
          repo,
          commitid,
        },
      })
    },
    select: ({ data }) => {
      return {
        yamlErrors: mapEdges(data?.owner?.repository?.commit?.yamlErrors) || [],
        botErrors: mapEdges(data?.owner?.repository?.commit?.botErrors) || [],
      }
    },
  })
}
