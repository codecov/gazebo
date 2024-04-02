import { PathContentsFilters } from 'services/pathContents/constants'
import { usePrefetchPullFileEntry } from 'services/pathContents/pull/file'

import { DisplayType } from '../../constants'
import FileEntry from '../BaseEntries/FileEntry'

interface PullFileEntryProps {
  commitSha: string
  path: string
  isCriticalFile: boolean
  name: string
  displayType: DisplayType
  urlPath: string
  filters?: PathContentsFilters
}

function PullFileEntry({
  commitSha,
  path,
  isCriticalFile,
  name,
  urlPath,
  displayType,
  filters,
}: PullFileEntryProps) {
  const flags =
    filters?.flags && filters?.flags?.length > 0 ? filters?.flags : []

  const { runPrefetch } = usePrefetchPullFileEntry({
    path,
    ref: commitSha,
  })

  return (
    <FileEntry
      urlPath={urlPath}
      isCriticalFile={isCriticalFile}
      name={name}
      displayType={displayType}
      path={path}
      runPrefetch={runPrefetch}
      pageName="pullFileView"
      queryParams={{ flags }}
    />
  )
}

export default PullFileEntry
