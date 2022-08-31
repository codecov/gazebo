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
                baseTotals {
                  percentCovered
                }
                headTotals {
                  percentCovered
                }
                changeWithParent
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
        ...res?.data?.owner?.repository?.pull,
      }
    })
  })
}

export function useImpactedFilesComparison({
  provider,
  owner,
  repo,
  pullId,
  filters,
}) {
  const query = `
  query ImpactedFilesComparison($owner: String!, $repo: String!, $pullId: Int!, $filters: ImpactedFilesFilters!) {
    owner(username: $owner) {
      repository(name: $repo) {
        pull(id: $pullId) {
          compareWithBase{
            patchTotals {
              percentCovered
            }
            baseTotals {
              percentCovered
            }
            headTotals {
              percentCovered
            }
            impactedFiles(filters:$filters) {
              fileName
              headName
              baseTotals {
                percentCovered
              }
              headTotals {
                percentCovered
              }
              patchTotals {
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
        filters,
      },
    })
  }

  function transformImpactedFilesData(compareWithBase) {
    const impactedFiles = compareWithBase?.impactedFiles?.map(
      (impactedFile) => {
        const headCoverage = impactedFile?.headTotals?.percentCovered
        const patchCoverage = impactedFile?.patchTotals?.percentCovered
        const baseCoverage = impactedFile?.baseTotals?.percentCovered
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
          fileName: impactedFile?.fileName,
        }
      }
    )
    return {
      impactedFiles,
      pullHeadCoverage: compareWithBase?.headTotals?.percentCovered,
      pullPatchCoverage: compareWithBase?.patchTotals?.percentCovered,
      pullBaseCoverage: compareWithBase?.baseTotals?.percentCovered,
    }
  }

  return useQuery(
    ['impactedFilesComparison', provider, owner, repo, pullId, filters],
    fetchImpactedFiles,
    {
      select: ({ data }) =>
        transformImpactedFilesData(
          data?.owner?.repository?.pull?.compareWithBase
        ),
      staleTime: 1000 * 60 * 5,
    }
  )
}

export function useSingularImpactedFileComparison({
  provider,
  owner,
  repo,
  pullId,
  path,
}) {
  const query = `
  query ImpactedFileComparison($owner: String!, $repo: String!, $pullId: Int!, $path: String!) {
    owner(username: $owner) {
      repository(name: $repo) {
        pull(id: $pullId) {
          compareWithBase{
            impactedFile(path:$path) {
              headName
              isNewFile
              isRenamedFile
              isDeletedFile
              isCriticalFile
              baseTotals {
                percentCovered
              }
              headTotals {
                percentCovered
              }
              patchTotals {
                percentCovered
              }
              changeCoverage
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
        }
      }
    }
  }
  `

  const fetchSingularImpactedFile = () => {
    return Api.graphql({
      provider,
      query,
      variables: {
        provider,
        owner,
        repo,
        pullId: parseInt(pullId, 10),
        path,
      },
    })
  }

  function transformImpactedFileData(impactedFile) {
    return {
      headName: impactedFile?.headName,
      isCriticalFile: impactedFile?.isCriticalFile,
      segments: impactedFile?.segments,
    }
  }

  return useQuery(
    ['impactedFileComparison', provider, owner, repo, pullId, path],
    fetchSingularImpactedFile,
    {
      select: ({ data }) =>
        transformImpactedFileData(
          data?.owner?.repository?.pull?.compareWithBase?.impactedFile
        ),
    }
  )
}
