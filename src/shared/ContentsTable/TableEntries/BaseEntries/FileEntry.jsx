import PropTypes from 'prop-types'

import A from 'ui/A'
import Icon from 'ui/Icon'

import { displayTypeParameter } from '../../constants'

const FileHeader = ({ displayAsList, filePath, name }) => {
  return (
    <div className="break-all flex gap-1 items-center">
      {!displayAsList && <Icon name="document" size="md" />}
      {displayAsList ? filePath : name}
    </div>
  )
}

FileHeader.propTypes = {
  filePath: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  displayAsList: PropTypes.bool.isRequired,
}

function FileEntry({
  linkRef,
  filePath,
  isCriticalFile,
  name,
  path,
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
            commitSha: commitSha,
            tree: displayAsList ? filePath : !!path ? `${path}/${name}` : name,
          },
        }}
      >
        <FileHeader
          displayAsList={displayAsList}
          filePath={filePath}
          name={name}
        />
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
  filePath: PropTypes.string.isRequired,
  isCriticalFile: PropTypes.bool,
  name: PropTypes.string.isRequired,
  displayType: PropTypes.oneOf(Object.values(displayTypeParameter)),
  path: PropTypes.string,
  runPrefetch: PropTypes.func,
  pageName: PropTypes.string,
  commitSha: PropTypes.string,
}

export default FileEntry
