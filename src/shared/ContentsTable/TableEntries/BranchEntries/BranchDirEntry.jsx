import PropTypes from 'prop-types'
import qs from 'qs'
import { useLocation } from 'react-router-dom'

import { usePrefetchBranchDirEntry } from 'services/pathContents/branch/dir'

import DirEntry from '../BaseEntries/DirEntry'

function BranchDirEntry({ branch, urlPath, name }) {
  const location = useLocation()

  const queryParams = qs.parse(location.search, {
    ignoreQueryPrefix: true,
    depth: 1,
  })

  const filters = {
    ...(queryParams?.flags ? { flags: queryParams.flags } : {}),
    ...(queryParams?.components ? { components: queryParams.components } : {}),
  }

  const { runPrefetch } = usePrefetchBranchDirEntry({
    branch,
    path: name,
    filters,
  })

  return (
    <DirEntry
      linkRef={branch}
      name={name}
      urlPath={urlPath}
      runPrefetch={runPrefetch}
      queryParams={filters}
    />
  )
}

BranchDirEntry.propTypes = {
  branch: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  urlPath: PropTypes.string,
}

export default BranchDirEntry
