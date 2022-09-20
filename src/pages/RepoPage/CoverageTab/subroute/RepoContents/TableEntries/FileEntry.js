import PropTypes from 'prop-types'

import A from 'ui/A'
import Icon from 'ui/Icon'

import { usePrefetchFileEntry } from './hooks/usePrefetchFileEntry'

function FileEntry({
  branch,
  filePath,
  isCriticalFile,
  isSearching,
  name,
  path,
}) {
  const { runPrefetch } = usePrefetchFileEntry({
    branch,
    path: filePath,
  })
  return (
    <div className="flex flex-col">
      <div
        className="flex gap-2"
        onMouseEnter={async () => await runPrefetch()}
      >
        <Icon name="document" size="md" />
        <A
          to={{
            pageName: 'fileViewer',
            options: {
              ref: branch,
              tree: isSearching ? filePath : !!path ? `${path}/${name}` : name,
            },
          }}
        >
          {name}
        </A>
        {isCriticalFile && (
          <span className="ml-2 px-1 py-0.5 border border-ds-gray-tertiary rounded text-xs text-ds-gray-senary">
            Critical File
          </span>
        )}
      </div>
      {/* TODO: change isSearching to isList */}
      {isSearching && <span className="text-xs pl-1">{filePath}</span>}
    </div>
  )
}

FileEntry.propTypes = {
  branch: PropTypes.string.isRequired,
  filePath: PropTypes.string.isRequired,
  isCriticalFile: PropTypes.bool,
  isSearching: PropTypes.bool.isRequired,
  name: PropTypes.string.isRequired,
  path: PropTypes.string,
}

export default FileEntry
