import { usePrefetchBranchFileEntry } from 'services/pathContents/branch/file'

import { useTypeSafeFilters } from './useTypeSafeFilters'

import { displayTypeParameter } from '../../constants'
import FileEntry from '../BaseEntries/FileEntry'

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
