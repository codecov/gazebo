import PropTypes from 'prop-types'

import A from 'ui/A'
import Icon from 'ui/Icon'

import { displayTypeParameter } from '../../constants'

const FileHeader = ({ displayAsList, path, name }) => {
  return (
    <div className="break-all flex gap-1 items-center">
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
}) {
  const displayAsList = displayType === displayTypeParameter.list
  return (
    <div onMouseEnter={async () => await runPrefetch()}>
      <A
        to={{
          pageName,
          options: {
            ref: linkRef,
            commit: commitSha,
            tree: displayAsList
              ? path
              : !!urlPath
              ? `${urlPath}/${name}`
              : name,
          },
        }}
      >
        <FileHeader displayAsList={displayAsList} path={path} name={name} />
      </A>
      {isCriticalFile && (
        <span className="ml-2 px-1 py-0.5 border border-ds-gray-tertiary rounded text-xs text-ds-gray-senary">
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
}

export default FileEntry
