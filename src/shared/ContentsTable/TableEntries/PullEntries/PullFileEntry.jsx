import PropTypes from 'prop-types'

import { usePrefetchPullFileEntry } from 'services/pathContents/pull/file'

import { displayTypeParameter } from '../../constants'
import FileEntry from '../BaseEntries/FileEntry'

function PullFileEntry({
  commitSHA,
  path,
  isCriticalFile,
  name,
  urlPath,
  displayType,
}) {
  const { runPrefetch } = usePrefetchPullFileEntry({
    path,
    ref: commitSHA,
  })

  return (
    <FileEntry
      urlPath={urlPath}
      isCriticalFile={isCriticalFile}
      name={name}
      displayType={displayType}
      path={path}
      runPrefetch={runPrefetch}
      pageName="pullFileView"
    />
  )
}

PullFileEntry.propTypes = {
  commitSHA: PropTypes.string.isRequired,
  pullId: PropTypes.string,
  urlPath: PropTypes.string,
  isCriticalFile: PropTypes.bool,
  name: PropTypes.string.isRequired,
  displayType: PropTypes.oneOf(Object.values(displayTypeParameter)),
  path: PropTypes.string,
}

export default PullFileEntry
