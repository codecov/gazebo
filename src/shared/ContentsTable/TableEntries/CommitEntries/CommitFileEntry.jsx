import PropTypes from 'prop-types'

import { usePrefetchCommitFileEntry } from './hooks/usePrefetchCommitFileEntry'

import { displayTypeParameter } from '../../constants'
import FileEntry from '../BaseEntries/FileEntry'

function CommitFileEntry({
  commitSha,
  path,
  isCriticalFile,
  name,
  urlPath,
  displayType,
}) {
  const { runPrefetch } = usePrefetchCommitFileEntry({
    path,
    commitSha: commitSha,
  })

  return (
    <FileEntry
      commitSha={commitSha}
      urlPath={urlPath}
      isCriticalFile={isCriticalFile}
      name={name}
      displayType={displayType}
      path={path}
      runPrefetch={runPrefetch}
      pageName="commitFileView"
    />
  )
}

CommitFileEntry.propTypes = {
  commitSha: PropTypes.string.isRequired,
  urlPath: PropTypes.string,
  isCriticalFile: PropTypes.bool,
  name: PropTypes.string.isRequired,
  displayType: PropTypes.oneOf(Object.values(displayTypeParameter)),
  path: PropTypes.string,
}

export default CommitFileEntry
