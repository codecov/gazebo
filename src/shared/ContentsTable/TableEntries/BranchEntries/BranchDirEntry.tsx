import { usePrefetchBranchDirEntry } from 'services/pathContents/branch/dir'

import { useTypeSafeFilters } from './useTypeSafeFilters'

import DirEntry from '../BaseEntries/DirEntry'

interface BranchDirEntryProps {
  branch: string
  name: string
  urlPath?: string
}

function BranchDirEntry({ branch, urlPath, name }: BranchDirEntryProps) {
  const filters = useTypeSafeFilters()

  const { runPrefetch } = usePrefetchBranchDirEntry({
    branch,
    path: name,
    filters,
  })

  return (
    <DirEntry
      linkRef={branch}
      name={name}
      urlPath={urlPath}
      runPrefetch={runPrefetch}
      queryParams={filters}
    />
  )
}

export default BranchDirEntry
