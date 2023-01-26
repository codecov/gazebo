import PropTypes from 'prop-types'

import { usePrefetchBranchDirEntry } from './hooks/usePrefetchBranchDirEntry'

import DirEntry from '../BaseEntries/DirEntry'

function BranchDirEntry({ branch, urlPath, name, filters }) {
  const { runPrefetch } = usePrefetchBranchDirEntry({
    branch,
    path: urlPath,
    filters,
  })

  return (
    <DirEntry
      linkRef={branch}
      name={name}
      urlPath={urlPath}
      runPrefetch={runPrefetch}
    />
  )
}

BranchDirEntry.propTypes = {
  branch: PropTypes.string.isRequired,
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

export default BranchDirEntry
