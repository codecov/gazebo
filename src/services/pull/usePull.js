import { useQuery } from '@tanstack/react-query'

import Api from 'shared/api'
import { userHasAccess } from 'shared/utils/user'

export function usePull({ provider, owner, repo, pullId }) {
  // TODO: We should revisit this hook cause I'm almost confident we don't need all this info, specially the filecomparisons part
  const query = `
    query Pull($owner: String!, $repo: String!, $pullId: Int!) {
        owner(username: $owner) {
          isCurrentUserPartOfOrg
          repository(name: $repo) {
            private
            pull(id: $pullId) {
              pullId
              title
              state
              author {
                username
              }
              updatestamp
              head {
                branchName
                ciPassed
                commitid
                totals {
                  percentCovered
                }
                uploads {
                  totalCount
                }
              }
              comparedTo {
                commitid
                uploads {
                  totalCount
                }
              }
              compareWithBase: compareWithBaseTemp {
                patchTotals {
                  percentCovered
                }
                baseTotals {
                  percentCovered
                }
                headTotals {
                  percentCovered
                }
                changeWithParent
                hasDifferentNumberOfHeadAndBaseReports
              }
              commits {
                edges {
                  node {
                    state
                    commitid
                    message
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
    }).then((res) => {
      return {
        hasAccess: userHasAccess({
          privateRepo: res?.data?.owner?.repository?.private,
          isCurrentUserPartOfOrg: res?.data?.owner?.isCurrentUserPartOfOrg,
        }),
        pull: res?.data?.owner?.repository?.pull,
      }
    })
  })
}
