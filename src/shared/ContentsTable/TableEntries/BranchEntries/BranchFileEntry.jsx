import PropTypes from 'prop-types'

import { usePrefetchBranchFileEntry } from 'services/pathContents/branch/file'

import { displayTypeParameter } from '../../constants'
import FileEntry from '../BaseEntries/FileEntry'

function BranchFileEntry({
  branch,
  path,
  isCriticalFile,
  name,
  urlPath,
  displayType,
  filters,
}) {
  const flags = filters?.flags?.length > 0 ? filters?.flags : []

  const { runPrefetch } = usePrefetchBranchFileEntry({
    branch,
    path,
    flags,
  })

  const queryParams = {
    flags: filters?.flags,
  }

  return (
    <FileEntry
      linkRef={branch}
      path={path}
      isCriticalFile={isCriticalFile}
      name={name}
      displayType={displayType}
      urlPath={urlPath}
      runPrefetch={runPrefetch}
      queryParams={queryParams}
    />
  )
}

BranchFileEntry.propTypes = {
  branch: PropTypes.string.isRequired,
  path: PropTypes.string,
  isCriticalFile: PropTypes.bool,
  name: PropTypes.string.isRequired,
  displayType: PropTypes.oneOf(Object.values(displayTypeParameter)),
  urlPath: PropTypes.string.isRequired,
  filters: PropTypes.shape({
    flags: PropTypes.arrayOf(PropTypes.string),
  }),
}

export default BranchFileEntry
