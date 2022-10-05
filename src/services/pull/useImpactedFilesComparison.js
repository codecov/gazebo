import { useQuery } from '@tanstack/react-query'
import isNumber from 'lodash/isNumber'

import Api from 'shared/api'

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
            head {
              state
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
              impactedFiles(filters:$filters) {
                fileName
                headName
                isCriticalFile
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
        filters,
      },
    })
  }

  function transformImpactedFilesData({ pull }) {
    const compareWithBase = pull?.compareWithBase
    const impactedFiles = compareWithBase?.impactedFiles?.map(
      (impactedFile) => {
        const headCoverage = impactedFile?.headCoverage?.percentCovered
        const patchCoverage = impactedFile?.patchCoverage?.percentCovered
        const baseCoverage = impactedFile?.baseCoverage?.percentCovered
        const changeCoverage =
          isNumber(headCoverage) && isNumber(baseCoverage)
            ? headCoverage - baseCoverage
            : Number.NaN
        const hasHeadOrPatchCoverage =
          isNumber(headCoverage) || isNumber(patchCoverage)

        return {
          headCoverage,
          patchCoverage,
          changeCoverage,
          hasHeadOrPatchCoverage,
          headName: impactedFile?.headName,
          fileName: impactedFile?.fileName,
          isCriticalFile: impactedFile?.isCriticalFile,
        }
      }
    )
    return {
      headState: pull?.head?.state,
      impactedFiles,
      pullHeadCoverage: compareWithBase?.headTotals?.percentCovered,
      pullPatchCoverage: compareWithBase?.patchTotals?.percentCovered,
      pullBaseCoverage: compareWithBase?.baseTotals?.percentCovered,
    }
  }

  return useQuery(
    ['ImpactedFilesComparison', provider, owner, repo, pullId, filters],
    fetchImpactedFiles,
    {
      select: ({ data }) =>
        transformImpactedFilesData({ pull: data?.owner?.repository?.pull }),
      staleTime: 1000 * 60 * 5,
    }
  )
}
