import qs from 'qs'
import { useMemo } from 'react'
import { useLocation } from 'react-router-dom'

import { usePrefetchBranchFileEntry } from 'services/pathContents/branch/file'

import { displayTypeParameter } from '../../constants'
import FileEntry from '../BaseEntries/FileEntry'

type Filters = {
  flags: string[]
  components: string[]
}

function useTypeSafeFilters(): Filters {
  const location = useLocation()
  const queryParams = qs.parse(location.search, {
    ignoreQueryPrefix: true,
    depth: 1,
  })

  return useMemo(() => {
    const filters: Filters = {
      flags: [],
      components: [],
    }

    if (
      queryParams?.flags &&
      Array.isArray(queryParams.flags) &&
      queryParams.flags.length > 0 &&
      queryParams.flags.every((val) => typeof val == 'string')
    ) {
      filters.flags = queryParams.flags
    }

    if (
      queryParams?.components &&
      Array.isArray(queryParams.components) &&
      queryParams.components.length > 0 &&
      queryParams.components.every((val) => typeof val == 'string')
    ) {
      filters.components = queryParams.components
    }

    return filters
  }, [queryParams])
}

interface BranchFileEntryProps {
  branch: string
  path: string
  name: string
  displayType?: (typeof displayTypeParameter)[keyof typeof displayTypeParameter]
  urlPath: string
}

function BranchFileEntry({
  branch,
  path,
  name,
  urlPath,
  displayType,
}: BranchFileEntryProps) {
  const filters = useTypeSafeFilters()

  const { runPrefetch } = usePrefetchBranchFileEntry({
    branch,
    path,
    flags: filters.flags,
  })

  return (
    <FileEntry
      linkRef={branch}
      path={path}
      name={name}
      displayType={displayType}
      urlPath={urlPath}
      runPrefetch={runPrefetch}
      queryParams={filters}
    />
  )
}

export default BranchFileEntry
