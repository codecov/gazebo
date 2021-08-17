import Api from 'shared/api'
import { useQuery } from 'react-query'
import { mapEdges } from 'shared/utils/graphql'

export function useCommit({ provider, owner, repo, commitid }) {
  const query = `
    query Commit($owner: String!, $repo: String!, $commitid: String!) {
        owner(username: $owner) {
          repository(name: $repo) {
            commit(id: $commitid) {
              totals {
                coverage # Absolute coverage of the commit
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
                          jobCode
                          downloadUrl
                          ciUrl
                          uploadType
                      }
                  }
              }
              yaml
              message
              ciPassed
              compareWithParent {
                impactedFiles {
                  path
                  baseTotals {
                    coverage
                  }
                  compareTotals {
                    coverage
                  }
                  patch {
                    coverage
                  }
                }
              }
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
      const commit = res?.data?.owner?.repository?.commit
      if (!commit) return null
      return {
        commit: {
          ...commit,
          uploads: mapEdges(commit?.uploads),
        },
      }
    })
  })
}
