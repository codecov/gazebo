import { useQuery } from '@tanstack/react-query'
import isNumber from 'lodash/isNumber'

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
    }).then((res) => {
      return {
        hasAccess: userHasAccess({
          privateRepo: res?.data?.owner?.repository?.private,
          isCurrentUserPartOfOrg: res?.data?.owner?.isCurrentUserPartOfOrg,
        }),
        ...res?.data?.owner?.repository?.pull,
      }
    })
  })
}

export function useImpactedFilesComparison({ provider, owner, repo, pullId }) {
  const query = `
  query ImpactedFilesComparison($owner: String!, $repo: String!, $pullId: Int!) {
    owner(username: $owner) {
      repository(name: $repo) {
        pull(id: $pullId) {
          compareWithBase{
            impactedFiles {
              baseName
              headName
              baseCoverage {
                percentCovered
              }
              headCoverage {
                percentCovered
              }
              patchCoverage {
                percentCovered
              }
              changeCoverage
            }
          }
        }
      }
    }
  }
  `

  const fetchImpactedFiles = () => {
    return Api.graphql({
      provider,
      query,
      variables: {
        provider,
        owner,
        repo,
        pullId: parseInt(pullId, 10),
      },
    })
  }

  function transformImpactedFilesData(impactedFile) {
    const headCoverage = impactedFile?.headCoverage?.percentCovered
    const patchCoverage = impactedFile?.patchCoverage?.percentCovered
    const baseCoverage = impactedFile?.baseCoverage?.percentCovered
    const changeCoverage =
      isNumber(headCoverage) && isNumber(baseCoverage)
        ? headCoverage - baseCoverage
        : Number.NaN
    const hasHeadAndPatchCoverage =
      isNumber(headCoverage) || isNumber(patchCoverage)

    return {
      headCoverage,
      patchCoverage,
      changeCoverage,
      hasHeadAndPatchCoverage,
      headName: impactedFile?.headName,
    }
  }

  return useQuery(
    ['impactedFileComparison', provider, owner, repo, pullId],
    fetchImpactedFiles,
    {
      select: ({ data }) =>
        data?.owner?.repository?.pull?.compareWithBase?.impactedFiles?.map(
          (impactedFile) => transformImpactedFilesData(impactedFile)
        ),
    }
  )
}
