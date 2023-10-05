import isEqual from 'lodash/isEqual'
import isNumber from 'lodash/isNumber'
import { useCallback, useState } from 'react'
import { useParams } from 'react-router-dom'

import { usePull } from 'services/pull'

const orderingDirection = Object.freeze({
  desc: 'DESC',
  asc: 'ASC',
})

export const orderingParameter = Object.freeze({
  name: 'FILE_NAME',
  change: 'CHANGE_COVERAGE',
  patch: 'PATCH_COVERAGE',
  head: 'HEAD_COVERAGE',
  missesCount: 'MISSES_COUNT',
})

function getFilters({ sortBy }) {
  return {
    ordering: {
      direction: sortBy?.desc ? orderingDirection.desc : orderingDirection.asc,
      parameter: orderingParameter[sortBy?.id],
    },
    hasUnintendedChanges: false,
  }
}

function transformImpactedFilesData({ pull }) {
  const compareWithBase = pull?.compareWithBase
  const impactedFiles = compareWithBase?.impactedFiles?.map((impactedFile) => {
    const headCoverage = impactedFile?.headCoverage?.percentCovered
    const missesCount = impactedFile?.missesCount || 0
    const patchCoverage = impactedFile?.patchCoverage?.percentCovered
    const baseCoverage = impactedFile?.baseCoverage?.percentCovered
    const changeCoverage =
      isNumber(headCoverage) && isNumber(baseCoverage)
        ? headCoverage - baseCoverage
        : Number.NaN
    const hasHeadOrPatchCoverage =
      isNumber(headCoverage) || isNumber(patchCoverage)

    return {
      missesCount,
      headCoverage,
      patchCoverage,
      changeCoverage,
      hasHeadOrPatchCoverage,
      headName: impactedFile?.headName,
      fileName: impactedFile?.fileName,
      isCriticalFile: impactedFile?.isCriticalFile,
      pullId: pull?.pullId,
    }
  })
  return {
    headState: pull?.head?.state,
    impactedFiles,
    pullHeadCoverage: compareWithBase?.headTotals?.percentCovered,
    pullPatchCoverage: compareWithBase?.patchTotals?.percentCovered,
    pullBaseCoverage: compareWithBase?.baseTotals?.percentCovered,
    compareWithBaseType: compareWithBase?.__typename,
  }
}

export function useImpactedFilesTable() {
  const { provider, owner, repo, pullId } = useParams()
  const [sortBy, setSortBy] = useState([{ id: 'missesCount', desc: true }])
  const filters = getFilters({ sortBy: sortBy[0] })

  const { data: pullData, isLoading } = usePull({
    provider,
    owner,
    repo,
    pullId,
    filters,
    options: {
      staleTime: 1000 * 60 * 5,
      suspense: false,
    },
  })

  const data = transformImpactedFilesData({
    pull: pullData?.pull,
  })

  const handleSort = useCallback(
    (tableSortBy) => {
      if (tableSortBy.length > 0 && !isEqual(sortBy, tableSortBy)) {
        setSortBy(tableSortBy)
      }
    },
    [sortBy]
  )

  return { data, isLoading, handleSort }
}
