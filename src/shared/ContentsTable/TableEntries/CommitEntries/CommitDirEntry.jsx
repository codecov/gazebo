import PropTypes from 'prop-types'

import { usePrefetchCommitDirEntry } from './hooks'

import DirEntry from '../BaseEntries/DirEntry'

function CommitDirEntry({ branch, path, name, filters }) {
  const { runPrefetch } = usePrefetchCommitDirEntry({ branch, path, filters })

  return (
    <DirEntry
      branch={branch}
      name={name}
      path={path}
      runPrefetch={runPrefetch}
    />
  )
}

CommitDirEntry.propTypes = {
  branch: PropTypes.string.isRequired,
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
