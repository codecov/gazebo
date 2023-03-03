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
}) {
  const { runPrefetch } = usePrefetchBranchFileEntry({
    branch,
    path,
  })

  return (
    <FileEntry
      linkRef={branch}
      path={path}
      isCriticalFile={isCriticalFile}
      name={name}
      displayType={displayType}
      urlPath={urlPath}
      runPrefetch={runPrefetch}
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
}

export default BranchFileEntry
