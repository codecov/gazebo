import PropTypes from 'prop-types'

import { usePrefetchCommitFileEntry } from 'services/pathContents/commit/file'

import { displayTypeParameter } from '../../constants'
import FileEntry from '../BaseEntries/FileEntry'

function CommitFileEntry({
  commitSha,
  path,
  isCriticalFile,
  name,
  urlPath,
  displayType,
  filters,
}) {
  const flags = filters?.flags?.length > 0 ? filters?.flags : []

  const { runPrefetch } = usePrefetchCommitFileEntry({
    path,
    commitSha,
    flags,
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
      pageName="commitFileDiff"
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
  filters: PropTypes.shape({
    flags: PropTypes.arrayOf(PropTypes.string),
  }),
}

export default CommitFileEntry
