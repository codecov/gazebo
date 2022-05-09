import { useQuery } from 'react-query'

import Api from 'shared/api'

import { usePullQuery } from '../../generated'

export function usePull2({ provider, owner, repo, pullId }) {
  const variables = { provider, owner, repo, pullId: parseInt(pullId, 10) }

  return usePullQuery(variables)
}

export function usePull({ provider, owner, repo, pullId }) {
  const query = `
    query Pull($owner: String!, $repo: String!, $pullId: Int!) {
        owner(username: $owner) {
          repository(name: $repo) {
            pull(id: $pullId) {
              pullId
              title
              state
              author {
                username
              }
              updatestamp
              head {
                commitid
                totals {
                  coverage
                }
              }
              comparedTo {
                commitid
              }
              compareWithBase {
                patchTotals {
                  coverage
                }
                changeWithParent
              }
              commits {
                totalCount
                pageInfo {
                  hasNextPage
                  startCursor
                  hasPreviousPage
                }
                edges {
                  node {
                    commitid
                    message
                    createdAt
                    author {
                      username
                    }
                  }
                }
              }
            }
          }
        }
      }
    `

  return useQuery(['pull', provider, owner, repo, pullId], () => {
    return Api.graphql({
      provider,
      query,
      variables: {
        provider,
        owner,
        repo,
        pullId: parseInt(pullId, 10),
      },
    }).then((res) => res?.data?.owner?.repository?.pull)
  })
}
