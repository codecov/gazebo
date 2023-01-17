import PropTypes from 'prop-types'

import { usePrefetchBranchDirEntry } from './hooks/usePrefetchBranchDirEntry'

import DirEntry from '../BaseEntries/DirEntry'

function BranchDirEntry({ branch, path, name, filters }) {
  const { runPrefetch } = usePrefetchBranchDirEntry({ branch, path, filters })

  return (
    <DirEntry
      linkRef={branch}
      name={name}
      path={path}
      runPrefetch={runPrefetch}
    />
  )
}

BranchDirEntry.propTypes = {
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

export default BranchDirEntry
