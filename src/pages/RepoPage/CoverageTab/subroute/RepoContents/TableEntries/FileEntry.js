import PropTypes from 'prop-types'

import A from 'ui/A'
import Icon from 'ui/Icon'

import { usePrefetchFileEntry } from './hooks/usePrefetchFileEntry'

import { displayTypeParameter } from '../../../constants'

function FileEntry({
  branch,
  filePath,
  isCriticalFile,
  name,
  path,
  displayType,
}) {
  const { runPrefetch } = usePrefetchFileEntry({
    branch,
    path: filePath,
  })
  const isList = displayType === displayTypeParameter.list
  return (
    <div className="flex flex-col">
      <div
        className="flex gap-2 items-center"
        onMouseEnter={async () => await runPrefetch()}
      >
        <A
          to={{
            pageName: 'fileViewer',
            options: {
              ref: branch,
              tree: isList ? filePath : !!path ? `${path}/${name}` : name,
            },
          }}
        >
          <Icon name="document" size="md" />
          {name}
        </A>
        {isCriticalFile && (
          <span className="ml-2 px-1 py-0.5 border border-ds-gray-tertiary rounded text-xs text-ds-gray-senary">
            Critical File
          </span>
        )}
      </div>
      {isList && (
        <span className="text-xs pl-1 text-ds-gray-quinary break-all">
          {filePath}
        </span>
      )}
    </div>
  )
}

FileEntry.propTypes = {
  branch: PropTypes.string.isRequired,
  filePath: PropTypes.string.isRequired,
  isCriticalFile: PropTypes.bool,
  name: PropTypes.string.isRequired,
  displayType: PropTypes.oneOf(Object.values(displayTypeParameter)),
  path: PropTypes.string,
}

export default FileEntry
