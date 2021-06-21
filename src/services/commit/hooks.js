import Api from 'shared/api'
import { useQuery } from 'react-query'

export function useCommit({ provider, owner, repo, commitid }) {
  const query = `
    query MyRepos($owner: String!, $repo: String!, $commitid: String!) {
        owner(username: $owner) {
          repository(name: $repo) {
            commit(id: $commitid) {
              totals {
                coverage # Absolute coverage of the commit
                diff {
                  coverage # patch coverage of the commit from the previous commit
                }
                coverage
              }
              commitid
              pullId
              createdAt
              author {
                  username
              }
              uploads {
                  edges {
                      node {
                          state
                          provider
                          createdAt
                          updatedAt
                          flags
                          downloadUrl
                          ciUrl
                          uploadType
                      }
                  }
              }
              yaml
              message
              ciPassed
              parent {
                commitid # commitid of the parent, used for the comparison
                
                totals { 
                  coverage # coverage of the parent
                }
              }
            }
          }
        }
      }
    `

  return useQuery(['commit', provider, owner, repo, commitid], () => {
    return Api.graphql({
      provider,
      query,
      variables: {
        provider,
        owner,
        repo,
        commitid,
      },
    }).then((res) => {
      return {
        commit: res?.data?.owner?.repository?.commit,
      }
    })
  })
}
