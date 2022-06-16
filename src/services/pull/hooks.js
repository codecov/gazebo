import { useQuery } from 'react-query'

import Api from 'shared/api'

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
                branchName
                ciPassed
                commitid
                totals {
                  percentCovered
                }
              }
              comparedTo {
                commitid
              }
              compareWithBase {
                patchTotals {
                  percentCovered
                }
                changeWithParent
              }
              compareWithBase {
                baseTotals {
                  percentCovered
                  fileCount
                  lineCount
                  hitsCount
                  missesCount
                  partialsCount
                }
                headTotals {
                  percentCovered
                  fileCount
                  lineCount
                  hitsCount
                  missesCount
                  partialsCount
                }
                fileComparisons {
                  baseName
                  headName
                  isNewFile
                  isRenamedFile
                  isDeletedFile
                  isCriticalFile
                  hasDiff
                  hasChanges
                  baseTotals {
                    percentCovered
                    lineCount
                    hitsCount
                    missesCount
                    partialsCount
                  }
                  headTotals {
                    percentCovered
                    lineCount
                    hitsCount
                    missesCount
                    partialsCount
                  }
                  patchTotals {
                    percentCovered
                    fileCount
                    lineCount
                    hitsCount
                    missesCount
                    partialsCount
                  }
                  segments {
                    header
                    hasUnintendedChanges
                    lines {
                      baseNumber
                      headNumber
                      baseCoverage
                      headCoverage
                      content
                    }
                  }
                }
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
                    state
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
