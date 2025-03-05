import { PathContentsFilters } from 'services/pathContents/constants'
import { usePrefetchPullDirEntry } from 'services/pathContents/pull/dir'

import DirEntry from '../BaseEntries/DirEntry'

interface PullDirEntryProps {
  pullId: string
  name: string
  urlPath?: string
  filters?: PathContentsFilters
}

function PullDirEntry({ pullId, urlPath, name, filters }: PullDirEntryProps) {
  const flags =
    filters?.flags && filters?.flags?.length > 0 ? filters?.flags : []

  const { runPrefetch } = usePrefetchPullDirEntry({
    pullId,
    path: urlPath ? `${urlPath}/${name}` : name,
    filters,
  })

  return (
    <DirEntry
      name={name}
      urlPath={urlPath}
      runPrefetch={runPrefetch}
      pageName="pullTreeView"
      queryParams={{ flags, dropdown: 'coverage' }}
    />
  )
}

export default PullDirEntry
