import PropTypes from 'prop-types'
import qs from 'qs'
import { useLocation } from 'react-router-dom'

import { usePrefetchBranchFileEntry } from 'services/pathContents/branch/file'

import { displayTypeParameter } from '../../constants'
import FileEntry from '../BaseEntries/FileEntry'

function BranchFileEntry({ branch, path, name, urlPath, displayType }) {
  const location = useLocation()
  const queryParams = qs.parse(location.search, {
    ignoreQueryPrefix: true,
    depth: 1,
  })

  const filters = {
    ...(queryParams?.flags ? { flags: queryParams.flags } : {}),
    ...(queryParams?.components ? { components: queryParams.components } : {}),
  }

  const flags = filters?.flags?.length > 0 ? filters?.flags : []

  const { runPrefetch } = usePrefetchBranchFileEntry({
    branch,
    path,
    flags,
  })

  return (
    <FileEntry
      linkRef={branch}
      path={path}
      name={name}
      displayType={displayType}
      urlPath={urlPath}
      runPrefetch={runPrefetch}
      queryParams={filters}
    />
  )
}

BranchFileEntry.propTypes = {
  branch: PropTypes.string.isRequired,
  path: PropTypes.string,
  name: PropTypes.string.isRequired,
  displayType: PropTypes.oneOf(Object.values(displayTypeParameter)),
  urlPath: PropTypes.string.isRequired,
}

export default BranchFileEntry
