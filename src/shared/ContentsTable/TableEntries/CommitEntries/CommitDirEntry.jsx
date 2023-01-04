import PropTypes from 'prop-types'

import { usePrefetchCommitDirEntry } from './hooks'

import DirEntry from '../BaseEntries/DirEntry'

function CommitDirEntry({ commitSha, path, name, filters }) {
  const { runPrefetch } = usePrefetchCommitDirEntry({
    commitSha,
    path,
    filters,
  })

  return (
    <DirEntry
      name={name}
      path={path}
      runPrefetch={runPrefetch}
      pageName="commitTreeView"
      commitSha={commitSha}
    />
  )
}

CommitDirEntry.propTypes = {
  commitSha: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  path: PropTypes.string,
  filters: PropTypes.shape({
    ordering: PropTypes.shape({
      direction: PropTypes.string,
      parameter: PropTypes.any,
    }),
    searchValue: PropTypes.any,
  }),
}

export default CommitDirEntry
