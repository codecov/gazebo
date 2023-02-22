import PropTypes from 'prop-types'

import { usePrefetchPullFileEntry } from './hooks/usePrefetchPullFileEntry'

import { displayTypeParameter } from '../../constants'
import FileEntry from '../BaseEntries/FileEntry'

function PullFileEntry({
  pullId,
  path,
  isCriticalFile,
  name,
  urlPath,
  displayType,
}) {
  const { runPrefetch } = usePrefetchPullFileEntry({
    path,
    pullId,
  })

  return (
    <FileEntry
      commitSha={null}
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
  pullId: PropTypes.string,
  urlPath: PropTypes.string,
  isCriticalFile: PropTypes.bool,
  name: PropTypes.string.isRequired,
  displayType: PropTypes.oneOf(Object.values(displayTypeParameter)),
  path: PropTypes.string,
}

export default PullFileEntry
