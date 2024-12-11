import PropTypes from 'prop-types'

import A from 'ui/A'
import Icon from 'ui/Icon'

import { displayTypeParameter } from '../../constants'

const FileHeader = ({ displayAsList, path, name }) => {
  return (
    <div className="flex items-center gap-1 break-all">
      {!displayAsList && <Icon name="document" size="md" />}
      {displayAsList ? path : name}
    </div>
  )
}

FileHeader.propTypes = {
  path: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  displayAsList: PropTypes.bool.isRequired,
}

function FileEntry({
  linkRef,
  path,
  isCriticalFile,
  name,
  urlPath,
  displayType,
  runPrefetch,
  pageName = 'fileViewer',
  commitSha,
  queryParams,
}) {
  const displayAsList = displayType === displayTypeParameter.list
  return (
    <div
      className="flex items-center"
      onMouseEnter={async () => await runPrefetch()}
    >
      <A
        to={{
          pageName,
          options: {
            ref: linkRef,
            commit: commitSha,
            tree: displayAsList ? path : urlPath ? `${urlPath}/${name}` : name,
            queryParams,
          },
        }}
      >
        <FileHeader displayAsList={displayAsList} path={path} name={name} />
      </A>
      {isCriticalFile && (
        <span className="ml-2 rounded border border-ds-gray-tertiary px-1 py-0.5 text-xs text-ds-gray-senary">
          Critical File
        </span>
      )}
    </div>
  )
}

FileEntry.propTypes = {
  linkRef: PropTypes.string,
  path: PropTypes.string,
  isCriticalFile: PropTypes.bool,
  name: PropTypes.string.isRequired,
  displayType: PropTypes.oneOf(Object.values(displayTypeParameter)),
  urlPath: PropTypes.string.isRequired,
  runPrefetch: PropTypes.func,
  pageName: PropTypes.string,
  commitSha: PropTypes.string,
  queryParams: PropTypes.object,
}

export default FileEntry
