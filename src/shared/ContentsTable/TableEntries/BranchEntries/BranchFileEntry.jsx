import PropTypes from 'prop-types'

import { usePrefetchBranchFileEntry } from './hooks/usePrefetchBranchFileEntry'

import { displayTypeParameter } from '../../constants'
import FileEntry from '../BaseEntries/FileEntry'

function BranchFileEntry({
  branch,
  filePath,
  isCriticalFile,
  name,
  path,
  displayType,
}) {
  const { runPrefetch } = usePrefetchBranchFileEntry({
    branch,
    path: filePath,
  })

  return (
    <FileEntry
      branch={branch}
      filePath={filePath}
      isCriticalFile={isCriticalFile}
      name={name}
      displayType={displayType}
      path={path}
      runPrefetch={runPrefetch}
    />
  )
}

BranchFileEntry.propTypes = {
  branch: PropTypes.string.isRequired,
  filePath: PropTypes.string.isRequired,
  isCriticalFile: PropTypes.bool,
  name: PropTypes.string.isRequired,
  displayType: PropTypes.oneOf(Object.values(displayTypeParameter)),
  path: PropTypes.string,
}

export default BranchFileEntry
