import PropTypes from 'prop-types'

import { usePrefetchPullFileEntry } from 'services/pathContents/pull/file'

import { displayTypeParameter } from '../../constants'
import FileEntry from '../BaseEntries/FileEntry'

function PullFileEntry({
  commitSha,
  path,
  isCriticalFile,
  name,
  urlPath,
  displayType,
  filters,
}) {
  const flags = filters?.flags?.length > 0 ? filters?.flags : []

  const { runPrefetch } = usePrefetchPullFileEntry({
    path,
    ref: commitSha,
    flags,
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
      queryParams={{ flags }}
    />
  )
}

PullFileEntry.propTypes = {
  commitSha: PropTypes.string.isRequired,
  pullId: PropTypes.string,
  urlPath: PropTypes.string,
  isCriticalFile: PropTypes.bool,
  name: PropTypes.string.isRequired,
  displayType: PropTypes.oneOf(Object.values(displayTypeParameter)),
  path: PropTypes.string,
  filters: PropTypes.shape({
    flags: PropTypes.arrayOf(PropTypes.string),
  }),
}

export default PullFileEntry
