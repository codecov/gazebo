import { usePrefetchCommitFileEntry } from 'services/pathContents/commit/file'
import { PathContentsFilters } from 'services/pathContents/constants'

import { DisplayType } from '../../constants'
import FileEntry from '../BaseEntries/FileEntry'

interface CommitFileEntryProps {
  commitSha: string
  path: string
  name: string
  displayType: DisplayType
  urlPath: string
  filters?: PathContentsFilters
}

function CommitFileEntry({
  commitSha,
  path,
  name,
  urlPath,
  displayType,
  filters,
}: CommitFileEntryProps) {
  const flags =
    filters?.flags && filters?.flags?.length > 0 ? filters?.flags : []
  const components =
    filters?.components && filters?.components?.length > 0
      ? filters?.components
      : []

  const { runPrefetch } = usePrefetchCommitFileEntry({
    path,
    commitSha,
    flags,
    components,
  })

  return (
    <FileEntry
      commitSha={commitSha}
      urlPath={urlPath}
      name={name}
      displayType={displayType}
      path={path}
      runPrefetch={runPrefetch}
      pageName="commitFileDiff"
      queryParams={{ flags, components, dropdown: 'coverage' }}
    />
  )
}

export default CommitFileEntry
