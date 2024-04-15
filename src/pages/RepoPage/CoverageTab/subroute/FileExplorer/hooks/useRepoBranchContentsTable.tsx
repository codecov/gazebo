import qs, { ParsedQs } from 'qs'
import { useMemo } from 'react'
import { useLocation, useParams } from 'react-router-dom'

import { useLocationParams } from 'services/navigation'
import { useRepoBranchContents } from 'services/pathContents/branch/dir'
import { PathContentDir, PathContentFile } from 'services/pathContents/pull/dir'
import { useRepoOverview } from 'services/repo'
import { displayTypeParameter } from 'shared/ContentsTable/constants'
import BranchDirEntry from 'shared/ContentsTable/TableEntries/BranchEntries/BranchDirEntry'
import BranchFileEntry from 'shared/ContentsTable/TableEntries/BranchEntries/BranchFileEntry'
import { adjustListIfUpDir } from 'shared/ContentsTable/utils'
import { useTreePaths } from 'shared/treePaths'
import { CommitErrorTypes } from 'shared/utils/commit'
import { determineProgressColor } from 'shared/utils/determineProgressColor'
import CoverageProgress from 'ui/CoverageProgress'

function determineDisplayType(
  displayType?: string | string[] | ParsedQs | ParsedQs[],
  isSearching?: boolean
) {
  return displayType?.toString().toUpperCase() === displayTypeParameter.list ||
    isSearching
    ? displayTypeParameter.list
    : displayTypeParameter.tree
}

const defaultQueryParams = {
  search: '',
  displayType: '',
  flags: [],
  components: [],
}

interface URLParams {
  provider: string
  owner: string
  repo: string
  path: string
  branch: string
}

export function useRepoBranchContentsTable(sortItem?: {
  ordering?: string
  direction: string
}) {
  const {
    provider,
    owner,
    repo,
    path: pathParam,
    branch: branchParam,
  } = useParams<URLParams>()
  const { params } = useLocationParams(defaultQueryParams)
  const { data: repoOverview } = useRepoOverview({
    provider,
    repo,
    owner,
  })

  const branch = (branchParam || repoOverview?.defaultBranch) as string
  const location = useLocation()

  const queryParams = qs.parse(location.search, {
    ignoreQueryPrefix: true,
    depth: 1,
  })

  const urlPath = pathParam || ''
  // useLocationParams needs to be updated to have full types
  // @ts-expect-error
  const isSearching = !!params?.search
  const selectedDisplayType = determineDisplayType(
    queryParams?.displayType,
    isSearching
  )

  const filters = useMemo(() => {
    return {
      ...(queryParams?.flags ? { flags: queryParams.flags } : {}),
      ...(queryParams?.components
        ? { components: queryParams.components }
        : {}),
      displayType: selectedDisplayType,
      ...(sortItem && {
        ordering: {
          direction: sortItem?.direction,
          parameter: sortItem?.ordering,
        },
      }),
      ...(queryParams?.search && { searchValue: queryParams.search }),
    }
  }, [
    queryParams.flags,
    queryParams.components,
    sortItem,
    queryParams.search,
    selectedDisplayType,
  ])

  const { data: branchData, isLoading } = useRepoBranchContents({
    provider,
    owner,
    repo,
    filters,
    branch,
    path: urlPath,
    options: {
      suspense: false,
    },
  })

  const indicationRange = branchData?.indicationRange

  const { treePaths } = useTreePaths()

  const finalizedTableRows = useMemo(() => {
    const tableData = branchData?.results

    if (!tableData?.length) {
      return []
    }

    const rawTableRows = tableData.map(
      (result: PathContentFile | PathContentDir) => {
        let name
        if (result?.__typename === 'PathContentDir') {
          name = (
            <BranchDirEntry
              name={result.name}
              branch={branch}
              urlPath={urlPath}
            />
          )
        } else if (result?.__typename === 'PathContentFile') {
          name = (
            <BranchFileEntry
              name={result.name}
              urlPath={urlPath}
              branch={branch}
              path={result.path}
              displayType={selectedDisplayType}
              isCriticalFile={result.isCriticalFile}
            />
          )
        }
        const lines = result.lines.toString()
        const hits = result.hits.toString()
        const partials = result.partials.toString()
        const misses = result.misses.toString()
        const coverage = (
          <CoverageProgress
            amount={result?.percentCovered}
            color={determineProgressColor({
              coverage: result.percentCovered,
              lowerRange: indicationRange?.lowerRange || 0,
              upperRange: indicationRange?.upperRange || 100,
            })}
          />
        )

        return {
          name,
          lines,
          hits,
          partials,
          misses,
          coverage,
        }
      }
    )

    const adjustedTableData = adjustListIfUpDir({
      treePaths,
      displayType: selectedDisplayType,
      rawTableRows,
    })

    return adjustedTableData
  }, [
    branchData?.results,
    branch,
    indicationRange,
    treePaths,
    urlPath,
    selectedDisplayType,
  ])

  return {
    data: finalizedTableRows ?? [],
    indicationRange: branchData?.indicationRange,
    // useLocationParams needs to be updated to have full types
    // @ts-expect-error
    hasFlagsSelected: params?.flags ? params?.flags?.length > 0 : false,
    // @ts-expect-error
    hasComponentsSelected: params?.components
      ? // useLocationParams needs to be updated to have full types
        // @ts-expect-error
        params?.components?.length > 0
      : false,
    isLoading,
    branch,
    isSearching,
    isMissingHeadReport:
      branchData?.pathContentsType === CommitErrorTypes.MISSING_HEAD_REPORT,
    pathContentsType: branchData?.pathContentsType,
    urlPath,
  }
}
