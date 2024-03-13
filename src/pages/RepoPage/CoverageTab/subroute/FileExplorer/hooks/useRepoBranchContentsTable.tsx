import { useParams } from 'react-router-dom'

import { useLocationParams } from 'services/navigation'
import { useRepoBranchContents } from 'services/pathContents/branch/dir'
import { useRepoOverview } from 'services/repo'
import { CommitErrorTypes } from 'shared/utils/commit'

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

  console.log('branchData', branchData)

  return {
    data: branchData,
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
