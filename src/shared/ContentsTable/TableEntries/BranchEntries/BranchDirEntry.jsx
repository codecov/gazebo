import PropTypes from 'prop-types'

import { usePrefetchBranchDirEntry } from 'services/pathContents/branch/dir'

import DirEntry from '../BaseEntries/DirEntry'

function BranchDirEntry({ branch, urlPath, name, filters }) {
  const { runPrefetch } = usePrefetchBranchDirEntry({
    branch,
    path: name,
    filters,
  })

  const queryParams = {
    flags: filters?.flags,
  }

  return (
    <DirEntry
      linkRef={branch}
      name={name}
      urlPath={urlPath}
      runPrefetch={runPrefetch}
      queryParams={queryParams}
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
    flags: PropTypes.arrayOf(PropTypes.string),
  }),
}

export default BranchDirEntry
