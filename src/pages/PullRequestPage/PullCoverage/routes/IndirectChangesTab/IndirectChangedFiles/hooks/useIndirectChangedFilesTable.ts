import { SortingState } from '@tanstack/react-table'
import isArray from 'lodash/isArray'
import isNumber from 'lodash/isNumber'
import qs, { ParsedQs } from 'qs'
import { useMemo, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'

import { PullSchemaType, usePull } from 'services/pull/usePull'

const orderingDirection = Object.freeze({
  desc: 'DESC',
  asc: 'ASC',
})

const orderingParameter = Object.freeze({
  name: 'FILE_NAME',
  change: 'CHANGE_COVERAGE',
  patch: 'PATCH_COVERAGE',
  head: 'HEAD_COVERAGE',
  missesCount: 'MISSES_COUNT',
})

function getFilters({
  sorting,
  flags,
  components,
}: {
  sorting: Array<{ id: string; desc: boolean }>
  flags?: ParsedQs[] | string[]
  components?: ParsedQs[] | string[]
}) {
  const state = sorting[0]
  const direction = state?.desc ? orderingDirection.desc : orderingDirection.asc

  let parameter = undefined
  if (state && state.id === 'name') {
    parameter = orderingParameter.name
  }

  if (state && state.id === 'missedLines') {
    parameter = orderingParameter.missesCount
  }

  if (state && state.id === 'head') {
    parameter = orderingParameter.head
  }

  if (state && state.id === 'change') {
    parameter = orderingParameter.change
  }

  return {
    ordering: {
      direction,
      parameter,
    },
    hasUnintendedChanges: true,
    ...(flags ? { flags } : {}),
    ...(components ? { components } : {}),
  }
}

function transformIndirectChangesData(pull: PullSchemaType | null | undefined) {
  if (!pull) {
    return null
  }

  if (pull?.compareWithBase?.__typename !== 'Comparison') {
    return {
      compareWithBaseType: pull.compareWithBase?.__typename,
    }
  }

  let impactedFiles
  if (
    pull?.compareWithBase?.__typename === 'Comparison' &&
    pull?.compareWithBase.impactedFiles.__typename === 'ImpactedFiles'
  ) {
    impactedFiles = pull?.compareWithBase?.impactedFiles?.results?.map(
      (impactedFile) => {
        const headCoverage = impactedFile?.headCoverage?.percentCovered
        const patchCoverage = impactedFile?.patchCoverage?.percentCovered
        const missesCount = impactedFile?.missesCount
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
          pullId: pull?.pullId,
        }
      }
    )
  }

  return {
    headState: pull?.head?.state,
    impactedFiles,
    pullHeadCoverage: pull.compareWithBase?.headTotals?.percentCovered,
    pullPatchCoverage: pull.compareWithBase?.patchTotals?.percentCovered,
    pullBaseCoverage: pull.compareWithBase?.baseTotals?.percentCovered,
    compareWithBaseType: pull.compareWithBase?.__typename,
    impactedFilesType: pull.compareWithBase?.impactedFiles?.__typename,
  }
}

interface URLParams {
  provider: string
  owner: string
  repo: string
  pullId: string
}

export const useIndirectChangedFilesTable = () => {
  const { provider, owner, repo, pullId } = useParams<URLParams>()
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'missedLines', desc: true },
  ])

  const location = useLocation()
  const queryParams = qs.parse(location.search, {
    ignoreQueryPrefix: true,
    depth: 1,
  })
  let flags = undefined
  let components = undefined
  if (isArray(queryParams?.flags) && queryParams?.flags?.length > 0) {
    flags = queryParams?.flags
  }

  if (isArray(queryParams?.components) && queryParams?.components?.length > 0) {
    components = queryParams?.components
  }

  const filters = getFilters({ sorting, flags, components })

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

  const data = useMemo(() => {
    return transformIndirectChangesData(pullData?.pull)
  }, [pullData?.pull])

  return { data, isLoading, sorting, setSorting }
}
