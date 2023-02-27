import PropTypes from 'prop-types'

import { usePrefetchCommitDirEntry } from 'services/pathContents/commit/dir'

import DirEntry from '../BaseEntries/DirEntry'

function CommitDirEntry({ commitSha, urlPath, name, filters }) {
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
    />
  )
}

CommitDirEntry.propTypes = {
  commitSha: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  urlPath: PropTypes.string,
  filters: PropTypes.shape({
    ordering: PropTypes.shape({
      direction: PropTypes.string,
      parameter: PropTypes.any,
    }),
    searchValue: PropTypes.any,
  }),
}

export default CommitDirEntry
