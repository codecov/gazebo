import isEqual from 'lodash/isEqual'
import isNumber from 'lodash/isNumber'
import { useCallback, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'

import { usePull } from 'services/pull'

const orderingDirection = Object.freeze({
  desc: 'DESC',
  asc: 'ASC',
})

const orderingParameter = Object.freeze({
  name: 'FILE_NAME',
  change: 'CHANGE_COVERAGE',
  patch: 'PATCH_COVERAGE',
  head: 'HEAD_COVERAGE',
})

function getFilters({ sortBy }) {
  return {
    ordering: {
      direction: sortBy?.desc ? orderingDirection.desc : orderingDirection.asc,
      parameter: orderingParameter[sortBy?.id],
    },
  }
}

function extractFilesWithIndirectChanges({ files }) {
  const impactedFiles = files?.filter((impactedFile) => {
    const segmentsWithIndirectChanges = impactedFile.segments.filter(
      (segment) => segment.hasUnintendedChanges
    )

    return !!segmentsWithIndirectChanges.length
  })

  return impactedFiles
}

function transformImpactedFilesData({ pull, isIndirectChangesTab = false }) {
  const files = isIndirectChangesTab
    ? extractFilesWithIndirectChanges({
        files: pull?.compareWithBase?.impactedFiles,
      })
    : pull?.compareWithBase?.impactedFiles

  const impactedFiles = files?.map((impactedFile) => {
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
  })
  return {
    headState: pull?.head?.state,
    impactedFiles,
    pullHeadCoverage: pull?.compareWithBase?.headTotals?.percentCovered,
    pullPatchCoverage: pull?.compareWithBase?.patchTotals?.percentCovered,
    pullBaseCoverage: pull?.compareWithBase?.baseTotals?.percentCovered,
  }
}

export function useImpactedFilesTable(isIndirectChangesTab) {
  const { provider, owner, repo, pullId } = useParams()
  const [sortBy, setSortBy] = useState([{ desc: true, id: 'change' }])
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

  const data = useMemo(
    () =>
      transformImpactedFilesData({
        pull: pullData?.pull,
        isIndirectChangesTab,
      }),
    [pullData?.pull, isIndirectChangesTab]
  )

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
