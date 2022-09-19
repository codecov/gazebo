import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'

import Api from 'shared/api'
import { mapEdges } from 'shared/utils/graphql'

export function useCommitErrors() {
  const { provider, owner, repo, commit: commitid } = useParams()
  const query = `
      query useCommitErrors($owner: String!, $repo: String!, $commitid: String!) {
        owner(username: $owner) {
          repository(name: $repo) {
            commit(id: $commitid) {
              yamlErrors{
                edges{
                    node{
                        errorCode
                    }
                }
              }
              botErrors{
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

  return useQuery(
    ['commit-errors', provider, owner, repo, commitid],
    () => {
      return Api.graphql({
        provider,
        query,
        variables: {
          owner,
          repo,
          commitid,
        },
      })
    },
    {
      select: ({ data }) => {
        return {
          yamlErrors:
            mapEdges(data?.owner?.repository?.commit?.yamlErrors) || [],
          botErrors: mapEdges(data?.owner?.repository?.commit?.botErrors) || [],
        }
      },
      staleTime: 1000 * 60 * 5,
    }
  )
}
