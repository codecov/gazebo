import { usePrefetchCommitDirEntry } from 'services/pathContents/commit/dir'
import { PathContentsFilters } from 'services/pathContents/constants'

import DirEntry from '../BaseEntries/DirEntry'

interface CommitDirEntryProps {
  commitSha: string
  name: string
  urlPath?: string
  filters?: PathContentsFilters
}

function CommitDirEntry({
  commitSha,
  urlPath,
  name,
  filters,
}: CommitDirEntryProps) {
  const flags =
    filters?.flags && filters?.flags?.length > 0 ? filters?.flags : []

  const components =
    filters?.components && filters?.components?.length > 0
      ? filters?.components
      : []

  const { runPrefetch } = usePrefetchCommitDirEntry({
    commit: commitSha,
    path: name,
    filters,
  })

  return (
    <DirEntry
      name={name}
      urlPath={urlPath}
      runPrefetch={runPrefetch}
      pageName="commitTreeView"
      commitSha={commitSha}
      queryParams={{ flags, components, dropdown: 'coverage' }}
    />
  )
}

export default CommitDirEntry
