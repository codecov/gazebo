import { useMemo } from 'react'
import { useParams } from 'react-router-dom'

import { useLocationParams } from 'services/navigation'
import {
  PathContentResultType,
  useRepoBranchContents,
} from 'services/pathContents/branch/dir'
import { useRepoOverview } from 'services/repo'
import { displayTypeParameter } from 'shared/ContentsTable/constants'
import BranchDirEntry from 'shared/ContentsTable/TableEntries/BranchEntries/BranchDirEntry'
import BranchFileEntry from 'shared/ContentsTable/TableEntries/BranchEntries/BranchFileEntry'
import { adjustListIfUpDir } from 'shared/ContentsTable/utils'
import { useTreePaths } from 'shared/treePaths'
import { CommitErrorTypes } from 'shared/utils/commit'
import { determineProgressColor } from 'shared/utils/determineProgressColor'
import CoverageProgress from 'ui/CoverageProgress'

const defaultQueryParams = {
  search: '',
  displayType: '',
  flags: [],
  components: [],
}

const getQueryFilters = (
  params: any,
  sortBy?: { direction?: string; ordering?: string }
) => {
  return {
    ...(params?.search && { searchValue: params.search }),
    // doing a ternary here because it's an array and arrays + && do not go well
    ...(params?.flags ? { flags: params.flags } : {}),
    ...(params?.components ? { components: params.components } : {}),
    ...(sortBy && {
      ordering: {
        direction: sortBy?.direction,
        parameter: sortBy?.ordering,
      },
    }),
  }
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
  const filters = getQueryFilters(params, sortItem)
  const urlPath = pathParam || ''

  const { data: branchData, isLoading } = useRepoBranchContents({
    provider,
    owner,
    repo,
    filters,
    branch,
    path: urlPath,
    opts: {
      suspense: false,
    },
  })

  const indicationRange = branchData?.indicationRange

  const { treePaths } = useTreePaths()

  const finalizedTableRows = useMemo(() => {
    const createTableData = (branchData: PathContentResultType[]) => {
      const yy = branchData.map((result) => {
        let name
        if (result?.__typename === 'PathContentDir') {
          name = (
            <BranchDirEntry
              name={result.name}
              branch={branch}
              urlPath={urlPath}
              filters={filters}
            />
          )
        }
        if (result?.__typename === 'PathContentFile') {
          name = (
            <BranchFileEntry
              name={result.name}
              urlPath={urlPath}
              branch={branch}
              path={result.path}
              displayType={displayTypeParameter.tree}
              isCriticalFile={result.isCriticalFile}
              filters={filters}
            />
          )
        }
        const lines = result?.lines
        const hits = result?.hits
        const partials = result?.partials
        const misses = result?.misses
        const percentCovered = (
          <CoverageProgress
            amount={result?.percentCovered}
            color={determineProgressColor({
              coverage: result?.percentCovered ?? null,
              ...indicationRange,
            })}
          />
        )

        return {
          name,
          lines,
          hits,
          partials,
          misses,
          percentCovered,
        }
      })

      return adjustListIfUpDir({
        treePaths,
        displayType: displayTypeParameter.tree,
        rawTableRows: yy,
      })
    }

    let rawData = createTableData(branchData?.results ?? [])
    return rawData
  }, [
    branchData?.results,
    branch,
    filters,
    indicationRange,
    treePaths,
    urlPath,
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
    // useLocationParams needs to be updated to have full types
    // @ts-expect-error
    isSearching: !!params?.search,
    isMissingHeadReport:
      branchData?.__typename === CommitErrorTypes.MISSING_HEAD_REPORT,
    pathContentsType: branchData?.pathContentsType,
    urlPath,
    filters,
  }
}
